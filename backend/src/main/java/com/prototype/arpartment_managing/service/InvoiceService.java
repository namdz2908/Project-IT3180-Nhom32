package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.InvoiceDTO;
import com.prototype.arpartment_managing.exception.*;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.model.Invoice;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.FeeRepository;
import com.prototype.arpartment_managing.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.HashMap;

@Primary
@Service
public class InvoiceService {
    @Autowired
    private InvoiceRepository invoiceRepository;
    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private QRCodeService qrCodeService;
    @Autowired
    private FeeService feeService;

    // Get all invoices
    public List<InvoiceDTO> getAllInvoices() {
        List<Invoice> invoices = invoiceRepository.findAll();
        return invoices.stream()
                .map(invoice -> {
                    Apartment apartment = invoice.getApartment();
                    return new InvoiceDTO(invoice, apartment);
                })
                .collect(Collectors.toList());
    }

    // Get Invoice Information (by Id for backend testing)
    public ResponseEntity<?> getInvoice(Long id) {
        if (id != null) {
            Invoice invoice = invoiceRepository.findById(id)
                    .orElseThrow(() -> new InvoiceNotFoundException(id));
            Apartment apartment = invoice.getApartment();
            return ResponseEntity.ok(new InvoiceDTO(invoice, apartment));
        } else {
            return ResponseEntity.badRequest().body("Must provide id");
        }
    }

    // Get Invoice Information (by APid and Type for frontend search)
    public ResponseEntity<?> getInvoiceByApartmentandType(String apartmentId, String type) {
        Invoice invoice = invoiceRepository.findByApartment_ApartmentIdAndType(apartmentId, type)
                .orElseThrow(() -> new InvoiceNotFoundExceptionType(type));
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        return ResponseEntity.ok(new InvoiceDTO(invoice, apartment));
    }

    public List<Invoice> getInvoiceByApartmentId(String apartmentId) {
        return invoiceRepository.findByApartment_ApartmentId(apartmentId);
    }

    @Transactional
    // Create Invoice
    public Invoice createInvoice(InvoiceDTO invoiceDTO) {
        // Validate Apartment ID
        if (invoiceDTO.getApartmentId() == null) {
            throw new IllegalArgumentException("Apartment ID must not be null");
        }

        // Get the apartment first to access its properties
        Apartment apartment = apartmentRepository.findByApartmentId(invoiceDTO.getApartmentId())
                .orElseThrow(() -> new ApartmentNotFoundException(invoiceDTO.getApartmentId()));

        Invoice invoice = new Invoice();

        // For Service type, automatically use the apartment area as the used value
        if ("Service".equals(invoiceDTO.getType()) && apartment.getArea() != null) {
            invoice.setUsed(apartment.getArea());
        } else {
            invoice.setUsed(invoiceDTO.getUsed());
        }

        invoice.setStatus(invoiceDTO.getStatus());
        invoice.setType(invoiceDTO.getType());

        // Set end date if provided
        if (invoiceDTO.getEndDate() != null) {
            invoice.setEndDate(invoiceDTO.getEndDate());
        }
        // Set apartment (already retrieved above)
        invoice.setApartment(apartment);

        Optional<Fee> feeOpt = feeRepository.findByType(invoiceDTO.getType());
        double calculatedTotal = feeOpt.map(fee -> invoiceDTO.getUsed() * fee.getPricePerUnit()).orElse(0.0);
        invoice.setTotal(calculatedTotal);

        invoice = invoiceRepository.save(invoice);

        // Update apartment
        apartment.getInvoices().add(invoice);
        apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
        apartmentRepository.save(apartment);

        return invoice;
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new InvoiceNotFoundException(id));

        Apartment apartment = invoice.getApartment();
        if (apartment != null && apartment.getInvoices() != null) {
            // Remove from list and break relationship
            apartment.getInvoices().removeIf(i -> i.getId().equals(id));
            invoice.setApartment(null);

            // Update total and save
            apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
            apartmentRepository.save(apartment);
        }

        invoiceRepository.deleteById(id);
    }

    @Transactional
    public Invoice updateInvoiceByID(InvoiceDTO invoiceDTO, Long id) {
        return invoiceRepository.findById(id)
                .map(existingInvoice -> {
                    // Update status
                    existingInvoice.setStatus(invoiceDTO.getStatus());

                    // Update used value if provided
                    if (invoiceDTO.getUsed() > 0) {
                        existingInvoice.setUsed(invoiceDTO.getUsed());

                        // Recalculate total based on new used value
                        Fee fee = feeRepository.findByType(existingInvoice.getType())
                                .orElseThrow(() -> new FeeNotFoundException(
                                        "Fee not found for type: " + existingInvoice.getType()));

                        double newTotal = existingInvoice.getUsed() * fee.getPricePerUnit();
                        existingInvoice.setTotal(newTotal);
                    }

                    // Save the updated invoice
                    Invoice savedInvoice = invoiceRepository.save(existingInvoice);

                    // Update apartment's total
                    Apartment apartment = savedInvoice.getApartment();
                    if (apartment != null) {
                        apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
                        apartmentRepository.save(apartment);
                    }

                    return savedInvoice;
                })
                .orElseThrow(() -> new InvoiceNotFoundException(id));
    }

    // tinh tong khoan thu cua 1 can ho
    public Double calculateTotalPayment(String apartmentId) {
        // Lấy danh sách các mục tiêu thụ của căn hộ
        List<Invoice> invoices = invoiceRepository.findByApartment_ApartmentId(apartmentId);

        // Nếu không còn khoản thu nào thì tổng = 0
        if (invoices.isEmpty()) {
            return 0.0;
        }

        double totalPayment = 0.0;
        // Duyệt từng loại tiêu thụ để tính tiền
        for (Invoice invoice : invoices) {
            // Update status based on end date
            invoice.updateStatus();

            if ("Unpaid".equals(invoice.getStatus()) || "Overdue".equals(invoice.getStatus())) {
                // Tìm mức giá tương ứng với loại tiêu thụ
                Fee fee = feeRepository.findByType(invoice.getType())
                        .orElseThrow(() -> new RuntimeException("Fee not found for type: " + invoice.getType()));

                // Tính tiền của mục tiêu thụ này
                double cost = invoice.getUsed() * fee.getPricePerUnit();

                totalPayment += cost;
            }
        }
        return totalPayment;
    }

    // danh sach full khoan thu cua 1 can ho
    public List<Invoice> findAllInvoiceByApartmentId(String apartmentId) {
        Optional<Apartment> apartment = apartmentRepository.findByApartmentId(apartmentId);
        return apartment.map(Apartment::getInvoices).orElse(null);
    }

    @Transactional
    public Map<String, Object> createInvoiceWithQR(InvoiceDTO invoiceDTO) {
        Invoice invoice = createInvoice(invoiceDTO);

        // Generate a unique payment token
        String paymentToken = UUID.randomUUID().toString();
        invoice.setPaymentToken(paymentToken);
        invoice = invoiceRepository.save(invoice);

        // Generate QR code
        String qrCodeBase64;
        try {
            qrCodeBase64 = qrCodeService.generateQRCodeImage(paymentToken);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("invoice", new InvoiceDTO(invoice, invoice.getApartment()));
        response.put("qrCode", qrCodeBase64);
        response.put("paymentToken", paymentToken);

        return response;
    }

    @Transactional
    public Map<String, Object> getQRCode(String paymentToken) {
        Map<String, Object> response = new HashMap<>();
        Invoice invoice = invoiceRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new InvoiceNotFoundException("Payment not found"));
        response.put("invoice", new InvoiceDTO(invoice, invoice.getApartment()));
        String qrCodeBase64;
        try {
            qrCodeBase64 = qrCodeService.generateQRCodeImage(paymentToken);
        } catch (Exception e) {
            throw new RuntimeException("Thất bại khi tạo mã code", e);
        }
        response.put("qrCode", qrCodeBase64);
        response.put("paymentToken", paymentToken);
        return response;
    }

    @Transactional
    public Invoice completePayment(String paymentToken) {
        Invoice invoice = invoiceRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new InvoiceNotFoundException("Không tìm thấy khoản thanh toán"));

        if ("Paid".equals(invoice.getStatus())) {
            throw new RuntimeException("Khoản thanh toán đã tồn tại");
        }

        if (invoice.isOverdue()) {
            throw new RuntimeException("Khoản thanh toán đã quá hạn");
        }

        invoice.setStatus("Paid");
        invoice.setPaidDate(LocalDateTime.now());
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice getInvoiceByPaymentToken(String paymentToken) {
        return invoiceRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new InvoiceNotFoundException("Payment not found"));
    }

    @Transactional
    public void updateAllInvoice() {
        List<Invoice> invoices = invoiceRepository.findAll();
        for (Invoice invoice : invoices) {
            invoice.updateStatus();
        }
    }

    public List<InvoiceDTO> getAllContributions(String apartmentId) {
        List<Invoice> invoices = invoiceRepository.findByApartment_ApartmentId(apartmentId);

        List<Invoice> contributions = new java.util.ArrayList<>(List.of());
        for (Invoice inv : invoices) {
            String type = inv.getType();
            if (feeService.getFeeByType(type).isPresent()) {
                if (feeService.getFeeByType(type).get().getPricePerUnit() == 1) {
                    contributions.add(inv);
                }
            }

        }
        return contributions.stream()
                .map(invoice -> {
                    Apartment apartment = invoice.getApartment();
                    return new InvoiceDTO(invoice, apartment);
                })
                .collect(Collectors.toList());
    }

    public List<InvoiceDTO> getInvoicesNotContribution(String apartmentId) {
        List<Invoice> invoices = invoiceRepository.findByApartment_ApartmentId(apartmentId);
        List<Invoice> contributions = new java.util.ArrayList<>(List.of());
        for (Invoice inv : invoices) {
            String type = inv.getType();
            if (feeService.getFeeByType(type).isPresent()) {
                if (feeService.getFeeByType(type).get().getPricePerUnit() != 1) {
                    contributions.add(inv);
                }
            }
        }
        return contributions.stream()
                .map(invoice -> {
                    Apartment apartment = invoice.getApartment();
                    return new InvoiceDTO(invoice, apartment);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get invoice statistics aggregated by type and status
     * 
     * @return A map containing aggregated statistics
     */
    public Map<String, Object> getInvoiceStatistics() {
        List<Invoice> allInvoices = invoiceRepository.findAll();

        // 1. Total invoice amount by type
        Map<String, Double> invoiceByType = allInvoices.stream()
                .collect(Collectors.groupingBy(
                        Invoice::getType,
                        Collectors.summingDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0)));

        // 2. Count by status
        Map<String, Long> countByStatus = allInvoices.stream()
                .collect(Collectors.groupingBy(
                        Invoice::getStatus,
                        Collectors.counting()));

        // 3. Monthly invoice data (last 6 months)
        Map<String, Double> monthlyInvoice = new HashMap<>();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        allInvoices.stream()
                .filter(i -> i.getCreateDate() != null && i.getCreateDate().isAfter(sixMonthsAgo))
                .forEach(i -> {
                    String monthYear = i.getCreateDate().getMonth().toString() + " " + i.getCreateDate().getYear();
                    monthlyInvoice.merge(monthYear, i.getTotal() != null ? i.getTotal() : 0.0, Double::sum);
                });

        Map<String, Object> stats = new HashMap<>();
        stats.put("invoiceByType", invoiceByType);
        stats.put("countByStatus", countByStatus);
        stats.put("monthlyInvoice", monthlyInvoice);
        stats.put("totalOverall",
                allInvoices.stream().mapToDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0).sum());

        return stats;
    }

    /**
     * Get invoices created on a specific date
     * Useful for verifying that scheduled invoice generation is working
     * 
     * @param date The date to check for created invoices
     * @return List of invoices created on the specified date
     */
    public List<InvoiceDTO> getInvoicesByCreateDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Invoice> invoices = invoiceRepository.findAll().stream()
                .filter(invoice -> {
                    LocalDateTime createDate = invoice.getCreateDate();
                    return createDate != null &&
                            createDate.isAfter(startOfDay) &&
                            createDate.isBefore(endOfDay);
                })
                .collect(Collectors.toList());

        return invoices.stream()
                .map(invoice -> new InvoiceDTO(invoice, invoice.getApartment()))
                .collect(Collectors.toList());
    }
}
