package com.prototype.arpartment_managing.scheduler;

import com.prototype.arpartment_managing.dto.RevenueDTO;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.service.RevenueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Scheduler to automatically generate monthly revenue records
 */
@Component
public class RevenueScheduler {

    private static final Logger logger = LoggerFactory.getLogger(RevenueScheduler.class);
    
    private final RevenueService revenueService;
    private final ApartmentRepository apartmentRepository;

    @Autowired
    public RevenueScheduler(RevenueService revenueService, ApartmentRepository apartmentRepository) {
        this.revenueService = revenueService;
        this.apartmentRepository = apartmentRepository;
    }

    /**
     * Creates monthly revenues for all apartments at 9:30 AM on the last day of every month
     * 
     * Cron expression: 0 30 9 L * ?
     * - 0 seconds
     * - 30 minutes
     * - 9 hours (9:30 AM)
     * - L = Last day of month
     * - * = Every month
     * - ? = Any day of week
     */    /**
     * Creates monthly revenues for all apartments at 9:30 AM on the last day of every month
     * Cron expression: 0 30 9 L * ? runs at 9:30 AM on the last day of every month
     */    @Scheduled(cron = "0 37 23 L * ?")
    public void generateMonthlyRevenues() {
        logger.info("Starting automatic monthly revenue generation at {}", LocalDateTime.now());
        
        try {
            List<Apartment> apartments = apartmentRepository.findAll();
            if (apartments.isEmpty()) {
                logger.warn("No apartments found in the database. Revenue generation skipped.");
                return;
            }
            
            logger.info("Found {} apartments to process", apartments.size());
            
            int count = 0;
            int failed = 0;
            
            // Set end date to the last day of the next month
            LocalDateTime endDate = LocalDateTime.now()
                    .plusMonths(1)
                    .with(TemporalAdjusters.lastDayOfMonth());            // Define revenue types to generate
            String[] revenueTypes = {"Service", "Water", "Electricity", "Vehicle"};

            for (Apartment apartment : apartments) {
                logger.info("Generating revenues for apartment {}", apartment.getApartmentId());
                
                try {
                    // Generate all types of revenues using the defined array
                    for (String type : revenueTypes) {
                        double usedValue = 0.0;
                        
                        // Calculate the appropriate usage value based on the type
                        switch (type) {
                            case "Service":
                                usedValue = calculateServiceUsage(apartment);
                                break;
                            case "Water":
                                usedValue = calculateWaterUsage(apartment);
                                break;
                            case "Electricity":
                                usedValue = calculateElectricityUsage(apartment);
                                break;
                            case "Vehicle":
                                usedValue = calculateVehicleUsage(apartment);
                                break;
                        }
                        
                        // Create the revenue
                        createRevenueForType(apartment, type, usedValue, endDate);
                    }
                    
                    count += 4; // 4 revenues per apartment
                } catch (Exception e) {
                    failed++;
                    logger.error("Failed to generate revenues for apartment {}: {}", 
                            apartment.getApartmentId(), e.getMessage(), e);
                }
            }
            
            logger.info("Revenue generation completed: {} records created for {} apartments, {} failures", 
                    count, apartments.size(), failed);
        } catch (Exception e) {
            logger.error("Error in monthly revenue generation process: {}", e.getMessage(), e);
        }
    }
      /**
     * Helper method to create a single revenue record for an apartment and type
     * This aligns with RevenueService.createRevenue implementation
     */
      private void createRevenueForType(Apartment apartment, String type, double usedValue, LocalDateTime endDate) {
        RevenueDTO revenueDTO = new RevenueDTO();
        revenueDTO.setApartmentId(apartment.getApartmentId());
        revenueDTO.setType(type);
        revenueDTO.setUsed(usedValue);
        revenueDTO.setStatus("Unpaid"); // Default status is "Unpaid"
        revenueDTO.setEndDate(endDate); // Set the payment due date
        
        try {
            // The createRevenue method will:
            // 1. Validate the apartment ID
            // 2. Create a new Revenue object
            // 3. Find the fee for this type and calculate the total
            // 4. Update the apartment's revenues list and total
            Revenue revenue = new Revenue();
            Map<String, Object> response = revenueService.createRevenueWithQR(revenueDTO);
            Object revenueObject = response.get("revenue");
            if (revenueObject instanceof Revenue){
                revenue = (Revenue) revenueObject;
            }
            // Reset the usage counters after creating the revenue
            // so they can start fresh for the next billing cycle
            resetUsageCounter(apartment, type);
            
            logger.info("Created {} revenue for apartment {} with ID {} - used value {}, amount {}, due date {}", 
                  type, apartment.getApartmentId(), revenue.getId(), usedValue, revenue.getTotal(), endDate);
        } catch (Exception e) {
            logger.error("Failed to create {} revenue for apartment {}: {}", 
                    type, apartment.getApartmentId(), e.getMessage(), e);
        }
    }
    
    /**
     * Reset the usage counter for the specified type after creating revenue
     */
    private void resetUsageCounter(Apartment apartment, String type) {
        try {
            switch (type) {
                case "Service":
                    // Service might be based on area, so we don't reset it
                    break;
                case "Water":
                    apartment.setWaterUsage(0.0);
                    break;
                case "Electricity":
                    apartment.setElectricityUsage(0.0);
                    break;
                case "Vehicle":
                    // Vehicle count might be constant, so don't reset
                    break;
            }
            apartmentRepository.save(apartment);
        } catch (Exception e) {
            logger.error("Failed to reset usage counter for {} in apartment {}: {}", 
                    type, apartment.getApartmentId(), e.getMessage());
        }
    }
      /**
     * Calculate usage values for different revenue types
     * These methods implement specific business logic for each revenue type
     * Based on RevenueService implementation patterns
     */    private double calculateServiceUsage(Apartment apartment) {
        // Service fees are typically based on apartment area
        try {
            if (apartment.getServiceUsage() != null && apartment.getServiceUsage() > 0) {
                // Use the stored service usage value
                return apartment.getServiceUsage();
            } else if (apartment.getArea() != null) {
                // If no specific service usage is set, use the apartment area
                // as service charges are often based on square footage
                return apartment.getArea();
            } else {
                return 1.0; // Fallback value if no area is defined
            }
        } catch (Exception e) {
            logger.warn("Error calculating service usage for apartment {}: {}", 
                    apartment.getApartmentId(), e.getMessage());
            return 1.0; // Fallback value
        }
    }
    
    private double calculateWaterUsage(Apartment apartment) {
        // Water usage from stored value or estimated based on occupants
        try {
            if (apartment.getWaterUsage() != null && apartment.getWaterUsage() >= 0) {
                // Use the stored water usage value
                return apartment.getWaterUsage();
            } else {
                return 5.0; // Default for a small household
            }
        } catch (Exception e) {
            logger.warn("Error calculating water usage for apartment {}: {}", 
                    apartment.getApartmentId(), e.getMessage());
            return 5.0; // Fallback value
        }
    }
    
    private double calculateElectricityUsage(Apartment apartment) {
        // Electricity usage from stored value or estimated based on occupants and area
        try {
            if (apartment.getElectricityUsage() != null && apartment.getElectricityUsage() >= 0) {
                // Use the stored electricity usage value
                return apartment.getElectricityUsage();
            } else {
                return 150.0; // Default for a small household
            }
        } catch (Exception e) {
            logger.warn("Error calculating electricity usage for apartment {}: {}", 
                    apartment.getApartmentId(), e.getMessage());
            return 150.0; // Fallback value
        }
    }
    
    private double calculateVehicleUsage(Apartment apartment) {
        // Vehicle count from stored value or default
        try {
            if (apartment.getVehicleCount() != null && apartment.getVehicleCount() >= 0) {
                // Use the stored vehicle count
                return apartment.getVehicleCount();
            } else {
                return 1.0; // Default of one vehicle
            }
        } catch (Exception e) {
            logger.warn("Error calculating vehicle usage for apartment {}: {}", 
                    apartment.getApartmentId(), e.getMessage());
            return 1.0; // Fallback value
        }
    }
    
    /**
     * For testing: Manually trigger the revenue generation
     * Can be called from a controller endpoint for manual testing
     */
    public void manuallyTriggerRevenueGeneration() {
        generateMonthlyRevenues();
    }
}
