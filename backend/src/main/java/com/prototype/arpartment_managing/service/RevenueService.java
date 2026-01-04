package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.RevenueDTO;
import com.prototype.arpartment_managing.exception.*;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.FeeRepository;
import com.prototype.arpartment_managing.repository.RevenueRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Primary
@Service
public class RevenueService {
    @Autowired
    private RevenueRepository revenueRepository;
    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private QRCodeService qrCodeService;
    @Autowired
    private FeeService feeService;

    // Get all revenues
    public List<RevenueDTO> getAllRevenues() {
        List<Revenue> revenues = revenueRepository.findAll();
        return revenues.stream()
                .map(revenue -> {
                    Apartment apartment = revenue.getApartment();
                    return new RevenueDTO(revenue, apartment);
                })
                .collect(Collectors.toList());
    }

    // Get Revenue Information (by Id for backend testing)
    public ResponseEntity<?> getRevenue(Long id) {
        if (id != null) {
            Revenue revenue = revenueRepository.findById(id)
                    .orElseThrow(() -> new RevenueNotFoundException(id));
            Apartment apartment = revenue.getApartment();
            return ResponseEntity.ok(new RevenueDTO(revenue, apartment));
        } else {
            return ResponseEntity.badRequest().body("Must provide id");
        }
    }

    // Get Revenue Information (by APid and Type for frontend search)
    public ResponseEntity<?> getRevenueByApartmentandType(String apartmentId, String type) {
        Revenue revenue = revenueRepository.findByApartment_ApartmentIdAndType(apartmentId, type)
                .orElseThrow(() -> new RevenueNotFoundExceptionType(type));
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        return ResponseEntity.ok(new RevenueDTO(revenue, apartment));
    }

    public List<Revenue> getRevenueByApartmentId(String apartmentId) {
        return revenueRepository.findByApartment_ApartmentId(apartmentId);
    }

    @Transactional
    // Create Revenue with comprehensive validation
    public Revenue createRevenue(RevenueDTO revenueDTO) {
        // 1. Validate Apartment ID
        if (revenueDTO.getApartmentId() == null || revenueDTO.getApartmentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Apartment ID must not be null or empty");
        }

        // 2. Get and validate apartment
        Apartment apartment = apartmentRepository.findByApartmentId(revenueDTO.getApartmentId())
                .orElseThrow(() -> new ApartmentNotFoundException(revenueDTO.getApartmentId()));

        // 3. Validate apartment has residents
        if (apartment.getResidents() == null || apartment.getResidents().isEmpty()) {
            throw new IllegalArgumentException("Cannot create revenue for apartment " + 
                    revenueDTO.getApartmentId() + ": No residents found in this apartment");
        }

        // 4. Validate apartment has active residents
        long activeResidentCount = apartment.getResidents().stream()
                .filter(User::isActive)
                .count();
        
        if (activeResidentCount == 0) {
            throw new IllegalArgumentException("Cannot create revenue for apartment " + 
                    revenueDTO.getApartmentId() + ": No active residents in this apartment");
        }

        // 5. Validate revenue type
        if (revenueDTO.getType() == null || revenueDTO.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Revenue type must not be null or empty");
        }

        // 6. Validate that fee exists for this type
        Fee fee = feeRepository.findByType(revenueDTO.getType())
                .orElseThrow(() -> new FeeNotFoundException("Fee not found for type: " + revenueDTO.getType()));

        // 7. Validate used value
        if (revenueDTO.getUsed() < 0) {
            throw new IllegalArgumentException("Used value cannot be negative");
        }

        // 8. Create revenue object
        Revenue revenue = new Revenue();

        // 9. Set used value (Service type uses apartment area)
        if ("Service".equals(revenueDTO.getType()) && apartment.getArea() != null) {
            revenue.setUsed(apartment.getArea().doubleValue());
        } else {
            revenue.setUsed(revenueDTO.getUsed());
        }

        // 10. Set status (default to "Unpaid" if not provided)
        revenue.setStatus(revenueDTO.getStatus() != null ? revenueDTO.getStatus() : "Unpaid");
        
        // 11. Set type
        revenue.setType(revenueDTO.getType());

        // 12. Set end date (default to last day of next month if not provided)
        if (revenueDTO.getEndDate() != null) {
            revenue.setEndDate(revenueDTO.getEndDate());
        } else {
            revenue.setEndDate(LocalDate.now()
                    .plusMonths(1)
                    .with(TemporalAdjusters.lastDayOfMonth())
                    .atStartOfDay());
        }

        // 13. Set apartment relationship
        revenue.setApartment(apartment);

        // 14. Calculate total
        double calculatedTotal = revenue.getUsed() * fee.getPricePerUnit();
        revenue.setTotal(calculatedTotal);

        // 15. Save revenue
        revenue = revenueRepository.save(revenue);

        // 16. Update apartment revenues list
        if (apartment.getRevenues() == null) {
            apartment.setRevenues(new ArrayList<>());
        }
        apartment.getRevenues().add(revenue);
        
        // 17. Update apartment total
        apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
        apartmentRepository.save(apartment);

        return revenue;
    }

    @Transactional
    public void deleteRevenue(Long id) {
        Revenue revenue = revenueRepository.findById(id)
                .orElseThrow(() -> new RevenueNotFoundException(id));

        Apartment apartment = revenue.getApartment();
        if (apartment != null && apartment.getRevenues() != null) {
            // Remove from list and break relationship
            apartment.getRevenues().removeIf(r -> r.getId().equals(id));
            revenue.setApartment(null);

            // Update total and save
            apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
            apartmentRepository.save(apartment);
        }

        revenueRepository.deleteById(id);
    }

    @Transactional
    public Revenue updateRevenueByID(RevenueDTO revenueDTO, Long id) {
        return revenueRepository.findById(id)
                .map(existingRevenue -> {
                    // Update status
                    existingRevenue.setStatus(revenueDTO.getStatus());

                    // Update used value if provided
                    if (revenueDTO.getUsed() > 0) {
                        existingRevenue.setUsed(revenueDTO.getUsed());

                        // Recalculate total based on new used value
                        Fee fee = feeRepository.findByType(existingRevenue.getType())
                                .orElseThrow(() -> new FeeNotFoundException(
                                        "Fee not found for type: " + existingRevenue.getType()));

                        double newTotal = existingRevenue.getUsed() * fee.getPricePerUnit();
                        existingRevenue.setTotal(newTotal);
                    }

                    // Save the updated revenue
                    Revenue savedRevenue = revenueRepository.save(existingRevenue);

                    // Update apartment's total
                    Apartment apartment = savedRevenue.getApartment();
                    if (apartment != null) {
                        apartment.setTotal(calculateTotalPayment(apartment.getApartmentId()));
                        apartmentRepository.save(apartment);
                    }

                    return savedRevenue;
                })
                .orElseThrow(() -> new RevenueNotFoundException(id));
    }

    // tinh tong khoan thu cua 1 can ho
    public Double calculateTotalPayment(String apartmentId) {
        // Lấy danh sách các mục tiêu thụ của căn hộ
        List<Revenue> revenues = revenueRepository.findByApartment_ApartmentId(apartmentId);

        // if (revenues.isEmpty()) {
        // throw new RuntimeException("No revenue records found for apartment: " +
        // apartmentId);
        // }

        // Nếu không còn khoản thu nào thì tổng = 0
        if (revenues.isEmpty()) {
            return 0.0;
        }

        double totalPayment = 0.0;
        // Duyệt từng loại tiêu thụ để tính tiền
        for (Revenue revenue : revenues) {
            // Update status based on end date
            revenue.updateStatus();

            if ("Unpaid".equals(revenue.getStatus()) || "Overdue".equals(revenue.getStatus())) {
                // Tìm mức giá tương ứng với loại tiêu thụ
                Fee fee = feeRepository.findByType(revenue.getType())
                        .orElseThrow(() -> new RuntimeException("Fee not found for type: " + revenue.getType()));

                // Tính tiền của mục tiêu thụ này
                double cost = revenue.getUsed() * fee.getPricePerUnit();

                // // Add penalty for overdue payments (e.g., 10% extra)
                // if ("Overdue".equals(revenue.getStatus())) {
                // cost *= 1.1; // 10% penalty for overdue payments
                // }

                totalPayment += cost;
            }
        }
        return totalPayment;
    }

    // danh sach full khoan thu cua 1 can ho
    public List<Revenue> findAllRevenueByApartmentId(String apartmentId) {
        Optional<Apartment> apartment = apartmentRepository.findByApartmentId(apartmentId);
        return apartment.map(Apartment::getRevenues).orElse(null);
    }

    @Transactional
    public Map<String, Object> createRevenueWithQR(RevenueDTO revenueDTO) {
        Revenue revenue = createRevenue(revenueDTO);

        // Generate a unique payment token
        String paymentToken = UUID.randomUUID().toString();
        revenue.setPaymentToken(paymentToken);
        revenue = revenueRepository.save(revenue);

        // Generate QR code
        String qrCodeBase64;
        try {
            qrCodeBase64 = qrCodeService.generateQRCodeImage(paymentToken);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("revenue", new RevenueDTO(revenue, revenue.getApartment()));
        response.put("qrCode", qrCodeBase64);
        response.put("paymentToken", paymentToken);

        return response;
    }

    @Transactional
    public Map<String, Object> getQRCode(String paymentToken) {
        Map<String, Object> response = new HashMap<>();
        Revenue revenue = revenueRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new RevenueNotFoundException("Payment not found"));
        response.put("revenue", new RevenueDTO(revenue, revenue.getApartment()));
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
    public Revenue completePayment(String paymentToken) {
        Revenue revenue = revenueRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new RevenueNotFoundException("Không tìm thấy khoản thanh toán"));

        if ("Paid".equals(revenue.getStatus())) {
            throw new RuntimeException("Khoản thanh toán đã tồn tại");
        }

        if (revenue.isOverdue()) {
            throw new RuntimeException("Khoản thanh toán đã quá hạn");
        }

        revenue.setStatus("Paid");
        revenue.setPaidDate(LocalDateTime.now());
        return revenueRepository.save(revenue);
    }

    @Transactional
    public Revenue getRevenueByPaymentToken(String paymentToken) {
        return revenueRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new RevenueNotFoundException("Payment not found"));
    }

    // public double calculateUsedValue(Revenue revenue, Apartment apartment) {
    // if ("Service".equals(revenue.getType()) && apartment != null) {
    // return apartment.getArea();
    // }
    // return revenue.getUsed();
    // }
    //
    // public double calculateTotal(Revenue revenue, Fee fee) {
    // double usedValue = calculateUsedValue(revenue, revenue.getApartment());
    // return usedValue * fee.getPricePerUnit();
    // }
    @Transactional
    public void updateAllRevenue() {
        List<Revenue> revenues = revenueRepository.findAll();
        for (Revenue revenue : revenues) {
            revenue.updateStatus();
        }
    }

    public List<RevenueDTO> getAllContributions(String apartmentId) {
        List<Revenue> revenues = revenueRepository.findByApartment_ApartmentId(apartmentId);

        List<Revenue> contributions = new java.util.ArrayList<>(List.of());
        for (Revenue re : revenues) {
            String type = re.getType();
            if (feeService.getFeeByType(type).isPresent()) {
                if (feeService.getFeeByType(type).get().getPricePerUnit() == 1) {
                    contributions.add(re);
                }
            }

        }
        return contributions.stream()
                .map(revenue -> {
                    Apartment apartment = revenue.getApartment();
                    return new RevenueDTO(revenue, apartment);
                })
                .collect(Collectors.toList());
    }

    public List<RevenueDTO> getRevenuesNotContribution(String apartmentId) {
        List<Revenue> revenues = revenueRepository.findByApartment_ApartmentId(apartmentId);
        List<Revenue> contributions = new java.util.ArrayList<>(List.of());
        for (Revenue re : revenues) {
            String type = re.getType();
            if (feeService.getFeeByType(type).isPresent()) {
                if (feeService.getFeeByType(type).get().getPricePerUnit() != 1) {
                    contributions.add(re);
                }
            }
        }
        return contributions.stream()
                .map(revenue -> {
                    Apartment apartment = revenue.getApartment();
                    return new RevenueDTO(revenue, apartment);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get revenues created on a specific date
     * Useful for verifying that scheduled revenue generation is working
     * 
     * @param date The date to check for created revenues
     * @return List of revenues created on the specified date
     */
    /**
     * Get revenue statistics aggregated by type and status
     * 
     * @return A map containing aggregated statistics
     */
    public Map<String, Object> getRevenueStatistics() {
        List<Revenue> allRevenues = revenueRepository.findAll();

        // 1. Total revenue by type
        Map<String, Double> revenueByType = allRevenues.stream()
                .collect(Collectors.groupingBy(
                        Revenue::getType,
                        Collectors.summingDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0)));

        // 2. Count by status
        Map<String, Long> countByStatus = allRevenues.stream()
                .collect(Collectors.groupingBy(
                        Revenue::getStatus,
                        Collectors.counting()));

        // 3. Monthly revenue data (last 6 months)
        Map<String, Double> monthlyRevenue = new HashMap<>();
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);

        allRevenues.stream()
                .filter(r -> r.getCreateDate() != null && r.getCreateDate().isAfter(sixMonthsAgo))
                .forEach(r -> {
                    String monthYear = r.getCreateDate().getMonth().toString() + " " + r.getCreateDate().getYear();
                    monthlyRevenue.merge(monthYear, r.getTotal() != null ? r.getTotal() : 0.0, Double::sum);
                });

        Map<String, Object> stats = new HashMap<>();
        stats.put("revenueByType", revenueByType);
        stats.put("countByStatus", countByStatus);
        stats.put("monthlyRevenue", monthlyRevenue);
        stats.put("totalOverall",
                allRevenues.stream().mapToDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0).sum());

        return stats;
    }


    /**
     * Get revenues created on a specific date
     * Useful for verifying that scheduled revenue generation is working
     * 
     * @param date The date to check for created revenues
     * @return List of revenues created on the specified date
     */
    public List<RevenueDTO> getRevenuesByCreateDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay().minusSeconds(1);

        List<Revenue> revenues = revenueRepository.findAll().stream()
                .filter(revenue -> {
                    LocalDateTime createDate = revenue.getCreateDate();
                    return createDate != null &&
                            createDate.isAfter(startOfDay) &&
                            createDate.isBefore(endOfDay);
                })
                .collect(Collectors.toList());

        return revenues.stream()
                .map(revenue -> new RevenueDTO(revenue, revenue.getApartment()))
                .collect(Collectors.toList());
    }
}
