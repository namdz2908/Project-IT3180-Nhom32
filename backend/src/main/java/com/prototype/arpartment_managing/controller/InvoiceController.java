package com.prototype.arpartment_managing.controller;

import com.prototype.arpartment_managing.dto.InvoiceDTO;
import com.prototype.arpartment_managing.model.Invoice;
import com.prototype.arpartment_managing.repository.InvoiceRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import com.prototype.arpartment_managing.scheduler.InvoiceScheduler;
import com.prototype.arpartment_managing.service.InvoiceService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("http://localhost:5000")
@RequestMapping("/invoices")
public class InvoiceController {
    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private InvoiceScheduler invoiceScheduler;

    @Autowired
    private com.prototype.arpartment_managing.util.LogMonitor logMonitor;

    // Get all invoices - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<InvoiceDTO> getAllInvoices() {
        return invoiceService.getAllInvoices();
    }

    // Create invoice - Admin only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createInvoice(@RequestBody InvoiceDTO invoiceDTO) {
        try {
            invoiceService.createInvoice(invoiceDTO);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Invoice created successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invoice creation failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Invoice creation failed due to server error.");
        }
    }

    // Get Invoice for testing - Admin only
    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<?> getInvoice(@RequestParam(required = false) Long id) {
        return invoiceService.getInvoice(id);
    }

    // Get Invoice by apartment and type - Admin or resident of the apartment
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    ResponseEntity<?> getInvoiceByApartmentandType(
            @RequestParam(required = true) String apartmentId,
            @RequestParam(required = true) String type) {
        return invoiceService.getInvoiceByApartmentandType(apartmentId, type);
    }

    // Delete invoice - Admin only
    @Transactional
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<?> deleteInvoiceByID(@RequestParam(required = false) Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.status(HttpStatus.CREATED).body("Invoice delete successfully");
    }

    // Update invoice - Admin only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Invoice updateInvoice(@RequestBody InvoiceDTO invoiceDTO, @PathVariable Long id) {
        return invoiceService.updateInvoiceByID(invoiceDTO, id);
    }

    // Get invoices by apartment ID - Admin or resident of the apartment
    @GetMapping("/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public List<Invoice> getInvoicesByApartmentID(@PathVariable String apartmentId) {
        return invoiceService.getInvoiceByApartmentId(apartmentId);
    }

    @PostMapping("/create-with-qr")
    public ResponseEntity<?> createInvoiceWithQR(@RequestBody InvoiceDTO invoiceDTO) {
        try {
            invoiceService.createInvoiceWithQR(invoiceDTO);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body("Invoice created successfully.");
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invoice creation failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Invoice creation failed due to server error.");
        }
    }

    @GetMapping("/getQRCode/{paymentToken}")
    public ResponseEntity<?> getQRCode(@PathVariable String paymentToken) {
        try {
            Map<String, Object> response = invoiceService.getQRCode(paymentToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

    @GetMapping("/complete-payment/{paymentToken}")
    public ResponseEntity<?> completePayment(@PathVariable String paymentToken) {
        try {
            Invoice invoice = invoiceService.completePayment(paymentToken);
            return ResponseEntity.ok(new InvoiceDTO(invoice, invoice.getApartment()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/getPayment/{paymentToken}")
    public ResponseEntity<?> getPayment(@PathVariable String paymentToken) {
        try {
            Invoice invoice = invoiceService.getInvoiceByPaymentToken(paymentToken);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/updateAll")
    public ResponseEntity<?> updateAllInvoices() {
        try {
            invoiceService.updateAllInvoice();
            return ResponseEntity.ok("Invoice update successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/contribution/{apartmentId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    public List<InvoiceDTO> getContribution(@PathVariable String apartmentId) {
        return invoiceService.getAllContributions(apartmentId);
    }

    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isResidentOfApartment(#apartmentId)")
    @GetMapping("/not-contribution/{apartmentId}")
    public List<InvoiceDTO> getInvoiceNotContribution(@PathVariable String apartmentId) {
        return invoiceService.getInvoicesNotContribution(apartmentId);
    }

    // Manually trigger invoice generation for testing - Admin only
    @PostMapping("/generate-monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> generateMonthlyInvoices() {
        try {
            // Record the count of invoices before
            int countBefore = invoiceService.getAllInvoices().size();

            // Trigger the scheduler manually
            invoiceScheduler.manuallyTriggerInvoiceGeneration();

            // Get the count after generation
            int countAfter = invoiceService.getAllInvoices().size();

            // Return informative response
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Monthly invoice generation triggered successfully");
            response.put("invoicesBefore", countBefore);
            response.put("invoicesAfter", countAfter);
            response.put("invoicesCreated", countAfter - countBefore);
            response.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate monthly invoices: " + e.getMessage());
        }
    }

    // Verify recently created invoices - Admin only
    @GetMapping("/verify-generated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyGeneratedInvoices(
            @RequestParam(required = false) String date) {
        try {
            LocalDate checkDate;
            if (date != null && !date.isEmpty()) {
                checkDate = LocalDate.parse(date);
            } else {
                checkDate = LocalDate.now();
            }

            // Get invoices created today or on specified date
            List<InvoiceDTO> todayInvoices = invoiceService.getInvoicesByCreateDate(checkDate);

            Map<String, Object> response = new HashMap<>();
            response.put("date", checkDate);
            response.put("invoiceCount", todayInvoices.size());
            response.put("invoices", todayInvoices);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to verify generated invoices: " + e.getMessage());
        }
    }

    // Get invoice generation logs - Admin only
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getInvoiceGenerationLogs(
            @RequestParam(required = false) String date) {
        try {
            LocalDate checkDate = null;
            if (date != null && !date.isEmpty()) {
                checkDate = LocalDate.parse(date);
            }

            List<String> logs = logMonitor.getRevenueGenerationLogs(checkDate);

            Map<String, Object> response = new HashMap<>();
            response.put("date", checkDate != null ? checkDate : "all");
            response.put("logCount", logs.size());
            response.put("logs", logs);
            response.put("wereInvoicesGeneratedToday", logMonitor.wereRevenuesGeneratedToday());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve invoice generation logs: " + e.getMessage());
        }
    }

    @GetMapping("/upcoming")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceDTO>> getUpcomingInvoices(
            @RequestParam(defaultValue = "7") int daysAhead) {

        LocalDateTime now = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endDate = now.plusDays(daysAhead).withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        // Get current authentication
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        String username = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Invoice> invoices;
        if (isAdmin) {
            // Admin sees everything
            invoices = invoiceRepository.findUpcomingDueDates(now, endDate);
        } else {
            // Individual user sees only their apartment's invoices
            com.prototype.arpartment_managing.model.User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (currentUser.getApartment() != null) {
                invoices = invoiceRepository.findUpcomingDueDatesByApartment(
                        currentUser.getApartment().getApartmentId(), now, endDate);
            } else {
                invoices = java.util.Collections.emptyList();
            }
        }

        List<InvoiceDTO> dtos = invoices.stream()
                .map(invoice -> new InvoiceDTO(invoice, invoice.getApartment()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStatistics() {
        try {
            return ResponseEntity.ok(invoiceService.getInvoiceStatistics());
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve statistics: " + e.getMessage());
        }
    }
}
