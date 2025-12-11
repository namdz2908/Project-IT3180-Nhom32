package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.exception.FeeInUseException;
import com.prototype.arpartment_managing.exception.FeeNotFoundException;
import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.repository.FeeRepository;
import com.prototype.arpartment_managing.repository.RevenueRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Primary
@Service
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;
    @Autowired
    private RevenueRepository revenueRepository;

    @Transactional
    public Fee createFee(Fee fee) {
        if (fee.getPricePerUnit() <= 0) {
            throw new IllegalArgumentException("Price per unit must be greater than 0");
        }

        // Check if a fee with the same type already exists
        Optional<Fee> existingFee = feeRepository.findByType(fee.getType());
        if (existingFee.isPresent()) {
            throw new IllegalArgumentException("Fee with type '" + fee.getType() + "' already exists");
        }

        return feeRepository.save(fee);
    }

    public Optional<Fee> getFeeByType(String type){
        return feeRepository.findByType(type);
    }

    @Transactional
    public Fee updateFee(Fee fee, String type) {
        Fee existingFee = feeRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Fee not found with type: " + type));

        // Check if there are any revenues using this fee type
        long revenueCount = revenueRepository.countByType(type);
        if (revenueCount > 0) {
            // If there are revenues, check if any have status other than "Unpaid"
            long nonUnpaidCount = revenueRepository.countByTypeAndStatusNotIn(type, List.of("Unpaid", "Overdue"));
            if (nonUnpaidCount > 0) {
                throw new FeeInUseException("Cannot update fee type '" + type + "' as it is being used in paid revenues");
            }
        }

        existingFee.setPricePerUnit(fee.getPricePerUnit());
        Fee savedFee = feeRepository.save(existingFee);

        revenueRepository.findByTypeAndStatusIn(type, List.of("Unpaid", "Overdue"))
                .forEach(revenue -> {
                    double newTotal = revenue.getUsed() * savedFee.getPricePerUnit();
                    revenue.setTotal(newTotal);
                    revenueRepository.save(revenue);
                });

        return savedFee;
    }

    @Transactional
    public void deleteFeeByType(String type) {
        // Check if fee exists
        Fee fee = feeRepository.findByType(type)
                .orElseThrow(() -> new RuntimeException("Fee not found with type: " + type));

        // Check if fee is being used in any revenues
        if (revenueRepository.existsByType(type)) {
            throw new FeeInUseException("Cannot delete fee type '" + type + "' as it is being used in existing revenues");
        }

        // If no revenues are using this fee, safe to delete
        feeRepository.delete(fee);
    }

    /**
     * Check if a fee type is safe to delete
     * @param type The fee type to check
     * @return true if the fee can be safely deleted, false otherwise
     */
    public boolean isFeeSafeToDelete(String type) {
        return !revenueRepository.existsByType(type);
    }

    /**
     * Get the count of revenues using a specific fee type
     * @param type The fee type to check
     * @return The number of revenues using this fee type
     */
    public long getRevenueCountForFeeType(String type) {
        return revenueRepository.countByType(type);
    }

    public Iterable<Fee> getAllFees() {
        return feeRepository.findAll();
    }

}
