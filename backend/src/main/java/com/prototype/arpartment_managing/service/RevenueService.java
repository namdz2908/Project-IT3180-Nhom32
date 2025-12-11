package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.RevenueDTO;
import com.prototype.arpartment_managing.exception.*;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.model.Revenue;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.HashMap;


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
    public ResponseEntity<?> getRevenue(Long id){
        if (id != null) {
            Revenue revenue = revenueRepository.findById(id)
                    .orElseThrow(() -> new RevenueNotFoundException(id));
            Apartment apartment = revenue.getApartment();
            return ResponseEntity.ok(new RevenueDTO(revenue,apartment));
        } else {
            return ResponseEntity.badRequest().body("Must provide id");
        }
    }

    // Get Revenue Information (by APid and Type for frontend search)
    public ResponseEntity<?> getRevenueByApartmentandType(String apartmentId, String type){
        Revenue revenue = revenueRepository.findByApartment_ApartmentIdAndType(apartmentId,type)
                .orElseThrow(() -> new RevenueNotFoundExceptionType(type));
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
        return ResponseEntity.ok(new RevenueDTO(revenue,apartment));
    }

    public List<Revenue> getRevenueByApartmentId(String apartmentId) {
        return revenueRepository.findByApartment_ApartmentId(apartmentId);
    }    
    
    @Transactional
    // Create Revenue
    public Revenue createRevenue(RevenueDTO revenueDTO) {
        // Validate Apartment ID
        if (revenueDTO.getApartmentId() == null) {
            throw new IllegalArgumentException("Apartment ID must not be null");
        }

        // Get the apartment first to access its properties
        Apartment apartment = apartmentRepository.findByApartmentId(revenueDTO.getApartmentId())
                .orElseThrow(() -> new ApartmentNotFoundException(revenueDTO.getApartmentId()));

        Revenue revenue = new Revenue();
        
        // For Service type, automatically use the apartment area as the used value
        if ("Service".equals(revenueDTO.getType()) && apartment.getArea() != null) {
            revenue.setUsed(apartment.getArea());
        } else {
            revenue.setUsed(revenueDTO.getUsed());
        }
        
        revenue.setStatus(revenueDTO.getStatus());
        revenue.setType(revenueDTO.getType());
        
        // Set end date if provided
        if (revenueDTO.getEndDate() != null) {
            revenue.setEndDate(revenueDTO.getEndDate());
        }
//        else{
//            revenue.setEndDate(LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atStartOfDay());
//        }        // Set apartment (already retrieved above)
        revenue.setApartment(apartment);


        Optional<Fee> feeOpt = feeRepository.findByType(revenueDTO.getType());
        double calculatedTotal = feeOpt.map(fee -> revenueDTO.getUsed() * fee.getPricePerUnit()).orElse(0.0);
        revenue.setTotal(calculatedTotal);

        revenue = revenueRepository.save(revenue);

        // Update apartment
        apartment.getRevenues().add(revenue);
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
                                .orElseThrow(() -> new FeeNotFoundException("Fee not found for type: " + existingRevenue.getType()));
                        
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
        if (revenues.isEmpty()) {
            throw new RuntimeException("No revenue records found for apartment: " + apartmentId);
        }

        double totalPayment = 0.0;
        // Duyệt từng loại tiêu thụ để tính tiền
        for (Revenue revenue : revenues) {
            // Update status based on end date
            revenue.updateStatus();
            
            if("Unpaid".equals(revenue.getStatus()) || "Overdue".equals(revenue.getStatus())) {
                // Tìm mức giá tương ứng với loại tiêu thụ
                Fee fee = feeRepository.findByType(revenue.getType())
                        .orElseThrow(() -> new RuntimeException("Fee not found for type: " + revenue.getType()));

                // Tính tiền của mục tiêu thụ này
                double cost = revenue.getUsed() * fee.getPricePerUnit();
                
                // // Add penalty for overdue payments (e.g., 10% extra)
                // if ("Overdue".equals(revenue.getStatus())) {
                //     cost *= 1.1; // 10% penalty for overdue payments
                // }
                
                totalPayment += cost;
            }
        }
        return totalPayment;
    }

    // danh sach full khoan thu cua 1 can ho
    public List<Revenue> findAllRevenueByApartmentId(String apartmentId) {
        Optional<Apartment> apartment =  apartmentRepository.findByApartmentId(apartmentId);
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
    public Revenue getRevenueByPaymentToken(String paymentToken){
        return revenueRepository.findByPaymentToken(paymentToken)
                .orElseThrow(() -> new RevenueNotFoundException("Payment not found"));
    }

//    public double calculateUsedValue(Revenue revenue, Apartment apartment) {
//        if ("Service".equals(revenue.getType()) && apartment != null) {
//            return apartment.getArea();
//        }
//        return revenue.getUsed();
//    }
//
//    public double calculateTotal(Revenue revenue, Fee fee) {
//        double usedValue = calculateUsedValue(revenue, revenue.getApartment());
//        return usedValue * fee.getPricePerUnit();
//    }
    @Transactional
    public void updateAllRevenue() {
        List<Revenue> revenues = revenueRepository.findAll();
        for(Revenue revenue : revenues) {
            revenue.updateStatus();
        }
    }

    public List<RevenueDTO> getAllContributions(String apartmentId) {
        List<Revenue> revenues = revenueRepository.findByApartment_ApartmentId(apartmentId);

        List<Revenue> contributions = new java.util.ArrayList<>(List.of());
        for(Revenue re : revenues){
            String type = re.getType();
            if(feeService.getFeeByType(type).isPresent()) {
                if(feeService.getFeeByType(type).get().getPricePerUnit() == 1){
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
        for(Revenue re : revenues){
            String type = re.getType();
            if(feeService.getFeeByType(type).isPresent()) {
                if(feeService.getFeeByType(type).get().getPricePerUnit() != 1){
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

