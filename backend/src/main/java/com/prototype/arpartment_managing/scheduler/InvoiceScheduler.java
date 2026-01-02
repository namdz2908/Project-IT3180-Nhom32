package com.prototype.arpartment_managing.scheduler;

import com.prototype.arpartment_managing.dto.InvoiceDTO;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Invoice;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.service.InvoiceService;
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
 * Scheduler to automatically generate monthly invoice records
 */
@Component
public class InvoiceScheduler {

    private static final Logger logger = LoggerFactory.getLogger(InvoiceScheduler.class);

    private final InvoiceService invoiceService;
    private final ApartmentRepository apartmentRepository;

    @Autowired
    public InvoiceScheduler(InvoiceService invoiceService, ApartmentRepository apartmentRepository) {
        this.invoiceService = invoiceService;
        this.apartmentRepository = apartmentRepository;
    }

    /**
     * Creates monthly invoices for all apartments at 9:30 AM on the last day of
     * every month
     * 
     * Cron expression: 0 30 9 L * ?
     * - 0 seconds
     * - 30 minutes
     * - 9 hours (9:30 AM)
     * - L = Last day of month
     * - * = Every month
     * - ? = Any day of week
     */
    @Scheduled(cron = "0 37 23 L * ?")
    public void generateMonthlyInvoices() {
        logger.info("Starting automatic monthly invoice generation at {}", LocalDateTime.now());

        try {
            List<Apartment> apartments = apartmentRepository.findAll();
            if (apartments.isEmpty()) {
                logger.warn("No apartments found in the database. Invoice generation skipped.");
                return;
            }

            logger.info("Found {} apartments to process", apartments.size());

            int count = 0;
            int failed = 0;

            // Set end date to the last day of the next month
            LocalDateTime endDate = LocalDateTime.now()
                    .plusMonths(1)
                    .with(TemporalAdjusters.lastDayOfMonth());

            // Define invoice types to generate
            String[] invoiceTypes = { "Service", "Water", "Electricity", "Vehicle" };

            for (Apartment apartment : apartments) {
                logger.info("Generating invoices for apartment {}", apartment.getApartmentId());

                try {
                    // Generate all types of invoices using the defined array
                    for (String type : invoiceTypes) {
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

                        // Create the invoice
                        createInvoiceForType(apartment, type, usedValue, endDate);
                    }

                    count += 4; // 4 invoices per apartment
                } catch (Exception e) {
                    failed++;
                    logger.error("Failed to generate invoices for apartment {}: {}",
                            apartment.getApartmentId(), e.getMessage(), e);
                }
            }

            logger.info("Invoice generation completed: {} records created for {} apartments, {} failures",
                    count, apartments.size(), failed);
        } catch (Exception e) {
            logger.error("Error in monthly invoice generation process: {}", e.getMessage(), e);
        }
    }

    /**
     * Helper method to create a single invoice record for an apartment and type
     */
    private void createInvoiceForType(Apartment apartment, String type, double usedValue, LocalDateTime endDate) {
        InvoiceDTO invoiceDTO = new InvoiceDTO();
        invoiceDTO.setApartmentId(apartment.getApartmentId());
        invoiceDTO.setType(type);
        invoiceDTO.setUsed(usedValue);
        invoiceDTO.setStatus("Unpaid"); // Default status is "Unpaid"
        invoiceDTO.setEndDate(endDate); // Set the payment due date

        try {
            Invoice invoice = new Invoice();
            Map<String, Object> response = invoiceService.createInvoiceWithQR(invoiceDTO);
            Object invoiceObject = response.get("invoice");
            if (invoiceObject instanceof Invoice) {
                invoice = (Invoice) invoiceObject;
            }
            // Reset the usage counters after creating the invoice
            resetUsageCounter(apartment, type);

            logger.info("Created {} invoice for apartment {} with ID {} - used value {}, amount {}, due date {}",
                    type, apartment.getApartmentId(), invoice.getId(), usedValue, invoice.getTotal(), endDate);
        } catch (Exception e) {
            logger.error("Failed to create {} invoice for apartment {}: {}",
                    type, apartment.getApartmentId(), e.getMessage(), e);
        }
    }

    /**
     * Reset the usage counter for the specified type after creating invoice
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
     * Calculate usage values for different invoice types
     */
    private double calculateServiceUsage(Apartment apartment) {
        try {
            if (apartment.getServiceUsage() != null && apartment.getServiceUsage() > 0) {
                return apartment.getServiceUsage();
            } else if (apartment.getArea() != null) {
                return apartment.getArea();
            } else {
                return 1.0;
            }
        } catch (Exception e) {
            logger.warn("Error calculating service usage for apartment {}: {}",
                    apartment.getApartmentId(), e.getMessage());
            return 1.0;
        }
    }

    private double calculateWaterUsage(Apartment apartment) {
        try {
            if (apartment.getWaterUsage() != null && apartment.getWaterUsage() >= 0) {
                return apartment.getWaterUsage();
            } else {
                return 5.0;
            }
        } catch (Exception e) {
            logger.warn("Error calculating water usage for apartment {}: {}",
                    apartment.getApartmentId(), e.getMessage());
            return 5.0;
        }
    }

    private double calculateElectricityUsage(Apartment apartment) {
        try {
            if (apartment.getElectricityUsage() != null && apartment.getElectricityUsage() >= 0) {
                return apartment.getElectricityUsage();
            } else {
                return 150.0;
            }
        } catch (Exception e) {
            logger.warn("Error calculating electricity usage for apartment {}: {}",
                    apartment.getApartmentId(), e.getMessage());
            return 150.0;
        }
    }

    private double calculateVehicleUsage(Apartment apartment) {
        try {
            if (apartment.getVehicleCount() != null && apartment.getVehicleCount() >= 0) {
                return apartment.getVehicleCount();
            } else {
                return 1.0;
            }
        } catch (Exception e) {
            logger.warn("Error calculating vehicle usage for apartment {}: {}",
                    apartment.getApartmentId(), e.getMessage());
            return 1.0;
        }
    }

    /**
     * For testing: Manually trigger the invoice generation
     */
    public void manuallyTriggerInvoiceGeneration() {
        generateMonthlyInvoices();
    }
}
