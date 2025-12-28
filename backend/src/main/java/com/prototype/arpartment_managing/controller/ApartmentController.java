package com.prototype.arpartment_managing.controller;

import com.prototype.arpartment_managing.dto.UserDTO;
import com.prototype.arpartment_managing.exception.ApartmentNotFoundException;
import com.prototype.arpartment_managing.exception.UserNotFoundException;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import com.prototype.arpartment_managing.service.ApartmentResidentService;
import com.prototype.arpartment_managing.service.ApartmentService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:5000")
@RequestMapping("/apartment")
public class ApartmentController {
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApartmentResidentService apartmentResidentService;
    @Autowired
    private ApartmentService apartmentService;

    // Get all apartments - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    List<Apartment> getAllApartments(){
        return apartmentService.getAllApartments();
    }

    // Create apartment - Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> newApartment(@RequestBody Apartment newApartment){
        apartmentService.createApartment(newApartment);
        return ResponseEntity.status(HttpStatus.CREATED).body("Apartment created successfully");
    }

    // Get apartment by ID - Admin or resident of the apartment
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    ResponseEntity<?> getApartment(@RequestParam(required = false) String apartmentId) {
        return apartmentService.getApartmentById(apartmentId);
    }

    // Get all residents of an apartment - Admin or resident of the apartment
    @GetMapping("/{apartmentId}/residents")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public ResponseEntity<?> getResidents(@PathVariable String apartmentId) {
        try {
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            List<UserDTO> residents = apartmentService.getResidentsByApartmentId(apartmentId);
            return ResponseEntity.ok(residents);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving residents: " + e.getMessage());
        }
    }

    // Delete apartment - Admin only
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<?> deleteApartment(@RequestParam(required = false) String apartmentId){
        apartmentService.deleteApartment(apartmentId);
        return ResponseEntity.status(HttpStatus.OK).body("Apartment delete successfully");
    }

    // Update apartment - Admin only
    @PutMapping("/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public Apartment updateApartment(@RequestBody Apartment newApartment, @PathVariable String apartmentId) {
        return apartmentService.updateApartment(newApartment, apartmentId);
    }

    // Add resident to apartment - Admin only
    @PutMapping("/add-resident/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addResidentToApartment(
            @PathVariable String apartmentId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String citizenIdentification) {
        try {
            if (citizenIdentification != null) {
                apartmentResidentService.addResidentToApartmentByCitizenIdentification(citizenIdentification, apartmentId);
            } else if (userId != null) {
                apartmentResidentService.addResidentToApartment(userId, apartmentId);
            } else {
                return ResponseEntity.badRequest().body("Must provide either userId or citizenIdentification.");
            }
            return ResponseEntity.ok("User successfully added to apartment " + apartmentId);
        } catch (ApartmentNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add resident to apartment: " + e.getMessage());
        }
    }

    // Remove resident from apartment - Admin only
    // Remove resident from apartment - Admin only
    @PutMapping("/remove-resident/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public ResponseEntity<?> removeResidentFromApartment(
            @PathVariable String apartmentId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String citizenIdentification) {
        try {
            if (citizenIdentification != null) {
                apartmentResidentService.removeResidentFromApartmentByCitizenIdentification(citizenIdentification, apartmentId);
            } else if (userId != null) {
                apartmentResidentService.removeResidentFromApartment(userId, apartmentId);
            } else {
                return ResponseEntity.badRequest().body("Must provide either userId or citizenIdentification.");
            }
            return ResponseEntity.ok("User successfully removed from apartment " + apartmentId);
        } catch (ApartmentNotFoundException | UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to remove resident from apartment: " + e.getMessage());
        }
    }


    // Calculate total revenue - Admin or resident of the apartment
    @PutMapping("/{apartmentId}/total")
    public ResponseEntity<?> totalRevenueOfApartment(@PathVariable String apartmentId) {
        try {
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            double total = apartmentService.calculateTotalPayment(apartmentId);
            apartment.setTotal(total);
            apartmentRepository.save(apartment);
            return ResponseEntity.ok(apartment);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error calculating total revenue: " + e.getMessage());
        }
    }

    // Calculate revenue by fee type - Admin or resident of the apartment
    @PutMapping("/{apartmentId}/{feeType}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public ResponseEntity<?> totalRevenueOfApartment(@PathVariable String apartmentId, @PathVariable String feeType) {
        try {
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            double total = apartmentService.calculateTotalPayment(apartmentId);
            apartment.setTotal(total);
            apartmentRepository.save(apartment);
            return ResponseEntity.ok(apartment);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error calculating total revenue: " + e.getMessage());
        }
    }

    // Generate bill for apartment - Admin or resident of the apartment
    @GetMapping("/{apartmentId}/bill")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public ResponseEntity<?> generateApartmentBill(@PathVariable String apartmentId,
                                                   @RequestParam(required = false) String status,
                                                   @RequestParam(required = false) String id,
                                                   @RequestParam(required = false) String isQR) {
        try {
            return apartmentService.generateBill(apartmentId, status, id, isQR);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating bill: " + e.getMessage());
        }
    }
    
    /**
     * Reset usage counters (serviceUsage, waterUsage, electricityUsage, vehicleCount)
     * This endpoint can be used to reset after billing or for scheduled resets
     * 
     * @param apartmentId Optional apartment ID to reset only one apartment
     * @return Response with count of apartments that were reset
     */
    @PostMapping("/reset-usage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetUsageCounters(@RequestParam(required = false) String apartmentId) {
        try {
            int resetCount = apartmentService.resetUsageCounters(apartmentId);
            
            String message = apartmentId != null
                ? "Successfully reset usage counters for apartment " + apartmentId
                : "Successfully reset usage counters for " + resetCount + " apartments";
                
            return ResponseEntity.ok(Map.of(
                "message", message,
                "count", resetCount
            ));
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error resetting usage counters: " + e.getMessage());
        }
    }
    //    @GetMapping("/{apartmentId}/bill/{id}")
//    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
//    public ResponseEntity<?> generateBill(@PathVariable String apartmentId, @PathVariable String id) {
//        try{
//            return apartmentService.generateOnlyBill(apartmentId, id);
//        } catch (ApartmentNotFoundException e){
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error generating bill: " + e.getMessage());
//        }
//    }

//    @PostMapping("/apartment/{apartmentId}/{feeType}")
//    public ResponseEntity<?> totalRevenueOfApartmentByType(@PathVariable String apartmentId ,@PathVariable String feeType) {
//        try {
//            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
//                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
//            double total = apartmentService.calculateFee(apartmentId, feeType);
//            return ResponseEntity.ok(total);
//        } catch (ApartmentNotFoundException e) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error calculating total revenue: " + e.getMessage());
//        }
//    }    /**
    //  * Update usage values for an apartment (service, water, electricity, vehicle)
    //  * Sets the specified usage values directly (replaces current values)
    //  * For Service type, automatically uses the apartment area for serviceUsage if not specified
    //  */
    @PutMapping("/{apartmentId}/usage")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateApartmentUsage(
            @PathVariable String apartmentId,
            @RequestParam(required = false) Double serviceUsage,
            @RequestParam(required = false) Double waterUsage,
            @RequestParam(required = false) Double electricityUsage,
            @RequestParam(required = false) Integer vehicleCount) {
        
        try {
            // Get the apartment first to check its area
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            
            // If serviceUsage is null, automatically set it to the apartment area
            Double finalServiceUsage = serviceUsage;
            if (serviceUsage == null && apartment.getArea() != null) {
                finalServiceUsage = apartment.getArea().doubleValue();
            }
            
            // Update all usage values with the service usage potentially modified
            Apartment updatedApartment = apartmentService.updateApartmentUsage(
                    apartmentId, finalServiceUsage, waterUsage, electricityUsage, vehicleCount);
            
            return ResponseEntity.ok(updatedApartment);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating apartment usage: " + e.getMessage());
        }
    }
      /**
     * Increment usage values for an apartment (service, water, electricity, vehicle)
     * Adds to the current values rather than replacing them
     * For Service type, automatically uses the apartment area for serviceUsage if not specified
     */
    @PatchMapping("/{apartmentId}/usage/increment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> incrementApartmentUsage(
            @PathVariable String apartmentId,
            @RequestParam(required = false) Double serviceUsage,
            @RequestParam(required = false) Double waterUsage,
            @RequestParam(required = false) Double electricityUsage,
            @RequestParam(required = false) Integer vehicleCount) {
        
        try {
            // Get the apartment first to check its area
            Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                    .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));
            
            // If serviceUsage is null, automatically set it to the apartment area
            Double finalServiceUsage = serviceUsage;
            if (serviceUsage == null && apartment.getArea() != null) {
                finalServiceUsage = apartment.getArea().doubleValue();
            }
            
            // Increment with the service usage potentially modified
            Apartment updatedApartment = apartmentService.incrementApartmentUsage(
                    apartmentId, finalServiceUsage, waterUsage, electricityUsage, vehicleCount);
            
            return ResponseEntity.ok(updatedApartment);
        } catch (ApartmentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error incrementing apartment usage: " + e.getMessage());
        }
    }
}