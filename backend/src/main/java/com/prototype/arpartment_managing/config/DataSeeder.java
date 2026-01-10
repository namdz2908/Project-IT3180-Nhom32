package com.prototype.arpartment_managing.config;

import com.prototype.arpartment_managing.model.Fee;
import com.prototype.arpartment_managing.repository.FeeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initFees(FeeRepository feeRepository) {
        return args -> {
            createFeeIfNotFound(feeRepository, "water", 5000);
            createFeeIfNotFound(feeRepository, "electricity", 1230);
            createFeeIfNotFound(feeRepository, "service", 8000);
            createFeeIfNotFound(feeRepository, "donate", 1);
        };
    }

    private void createFeeIfNotFound(FeeRepository feeRepository, String type, double price) {
        if (feeRepository.findByType(type).isEmpty()) {
            Fee fee = new Fee();
            fee.setType(type);
            fee.setPricePerUnit(price);
            feeRepository.save(fee);
            System.out.println("Seeded missing fee: " + type);
        }
    }
}
