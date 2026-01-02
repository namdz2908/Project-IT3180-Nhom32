package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Invoice;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.InvoiceRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private ApartmentRepository apartmentRepository;

        @Autowired
        private InvoiceRepository invoiceRepository;

        public Map<String, Object> getDashboardStatistics() {
                Map<String, Object> stats = new HashMap<>();

                // 1. Resident Statistics
                List<User> allUsers = userRepository.findAll();
                long activeResidents = allUsers.stream().filter(User::isActive).count();
                // Inactive residents: those who have moved out (movedOutAt != null) or
                // explicitly marked inactive
                long movedOutResidents = allUsers.stream()
                                .filter(u -> !u.isActive() || u.getMovedOutAt() != null)
                                .count();

                Map<String, Object> residentsStats = new HashMap<>();
                residentsStats.put("activeResidents", activeResidents);
                residentsStats.put("movedOutResidents", movedOutResidents);

                // 2. Apartment Statistics
                List<Apartment> allApartments = apartmentRepository.findAll();
                long totalApartments = allApartments.size();

                // Group by type
                Map<String, Long> apartmentTypes = allApartments.stream()
                                .collect(Collectors.groupingBy(Apartment::getApartmentType, Collectors.counting()));

                residentsStats.put("totalApartments", totalApartments);
                residentsStats.put("apartmentTypes", apartmentTypes);

                stats.put("residents", residentsStats);

                // 3. Financial Statistics
                List<Invoice> allInvoices = invoiceRepository.findAll();

                // Using helper class/map to store count and amount
                Map<String, Object> financialStats = new HashMap<>();

                // Total Invoices
                double totalAmount = allInvoices.stream()
                                .mapToDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0)
                                .sum();
                financialStats.put("totalInvoices", Map.of("count", allInvoices.size(), "amount", totalAmount));

                // Paid
                List<Invoice> paidInvoices = allInvoices.stream()
                                .filter(i -> "Paid".equalsIgnoreCase(i.getStatus()))
                                .collect(Collectors.toList());
                double paidAmount = paidInvoices.stream().mapToDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0)
                                .sum();
                financialStats.put("paid", Map.of("count", paidInvoices.size(), "amount", paidAmount));

                // Unpaid
                List<Invoice> unpaidInvoices = allInvoices.stream()
                                .filter(i -> "Unpaid".equalsIgnoreCase(i.getStatus()))
                                .collect(Collectors.toList());
                double unpaidAmount = unpaidInvoices.stream()
                                .mapToDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0).sum();
                financialStats.put("unpaid", Map.of("count", unpaidInvoices.size(), "amount", unpaidAmount));

                // Overdue
                List<Invoice> overdueInvoices = allInvoices.stream()
                                .filter(i -> "Overdue".equalsIgnoreCase(i.getStatus()))
                                .collect(Collectors.toList());
                double overdueAmount = overdueInvoices.stream()
                                .mapToDouble(i -> i.getTotal() != null ? i.getTotal() : 0.0)
                                .sum();
                financialStats.put("overdue", Map.of("count", overdueInvoices.size(), "amount", overdueAmount));

                stats.put("financials", financialStats);

                return stats;
        }
}
