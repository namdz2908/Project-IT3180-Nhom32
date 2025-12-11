package com.prototype.arpartment_managing.controller;


import com.prototype.arpartment_managing.exception.FeeInUseException;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.service.FeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/fees")
@CrossOrigin("http://localhost:5000")
public class FeeController {

    @Autowired
    private FeeService feeService;

    // Lấy tất cả các phí
    @GetMapping
    //@PreAuthorize("hasRole('ADMIN')")
    public Iterable<Fee> getAllFees() {
        return feeService.getAllFees();
    }

    // Lấy phí theo type
    @GetMapping("/{type}")
    //@PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#id)")
    public ResponseEntity<?> getFee(@PathVariable String type) {
        Optional<Fee> fee = feeService.getFeeByType(type);
        // Nếu Fee tồn tại, trả về 200 OK cùng với dữ liệu Fee
        if (fee.isPresent()) {
            return ResponseEntity.ok(fee.get());
        } else {
            // Nếu Fee không tồn tại, trả về 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Fee not found");
        }
    }

    // Create fee - Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createFee(@RequestBody Fee fee) {
        try {
            feeService.createFee(fee);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Fee created successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Fee creation failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fee creation failed due to server error.");
        }
    }

    // Cập nhật phí theo type (chỉ cần sửa pricePerUnit, nhưng vẫn gửi toàn bộ Fee)
    @PutMapping("/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFee(@PathVariable String type, @RequestBody Fee fee) {
        try {
            Fee updated = feeService.updateFee(fee, type);
            return ResponseEntity.ok(updated);
        } catch (FeeInUseException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Update failed: " + e.getMessage()));
        }
    }

    // Xóa phí theo type
    @DeleteMapping("/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFee(@PathVariable String type) {
        try {
            // Check if fee is safe to delete
            if (!feeService.isFeeSafeToDelete(type)) {
                long count = feeService.getRevenueCountForFeeType(type);
                Map<String, Object> response = new HashMap<>();
                response.put("error", "Cannot delete fee type '" + type + "'");
                response.put("message", "This fee type is currently being used in " + count + " revenue records");
                response.put("action", "Please update or delete the associated revenue records first");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            feeService.deleteFeeByType(type);
            return ResponseEntity.ok(Map.of("message", "Fee deleted successfully"));
        } catch (FeeInUseException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deleting fee: " + e.getMessage()));
        }
    }

}
