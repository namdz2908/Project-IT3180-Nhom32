package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.RevenueRepository;
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
        private RevenueRepository revenueRepository;

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

                long totalVehicles = allApartments.stream()
                                .mapToLong(a -> a.getVehicleCount() != null ? a.getVehicleCount() : 0)
                                .sum();

                residentsStats.put("totalApartments", totalApartments);
                residentsStats.put("apartmentTypes", apartmentTypes);
                residentsStats.put("totalVehicles", totalVehicles);

                stats.put("residents", residentsStats);

                // 3. Financial Statistics
                List<Revenue> allRevenues = revenueRepository.findAll();

                // Using helper class/map to store count and amount
                Map<String, Object> financialStats = new HashMap<>();

                // Total Invoices
                double totalAmount = allRevenues.stream()
                                .mapToDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0)
                                .sum();
                financialStats.put("totalInvoices", Map.of("count", allRevenues.size(), "amount", totalAmount));

                // Paid
                List<Revenue> paidRevenues = allRevenues.stream()
                                .filter(r -> "Paid".equalsIgnoreCase(r.getStatus()))
                                .collect(Collectors.toList());
                double paidAmount = paidRevenues.stream().mapToDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0)
                                .sum();
                financialStats.put("paid", Map.of("count", paidRevenues.size(), "amount", paidAmount));

                // Unpaid
                List<Revenue> unpaidRevenues = allRevenues.stream()
                                .filter(r -> "Unpaid".equalsIgnoreCase(r.getStatus()))
                                .collect(Collectors.toList());
                double unpaidAmount = unpaidRevenues.stream()
                                .mapToDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0).sum();
                financialStats.put("unpaid", Map.of("count", unpaidRevenues.size(), "amount", unpaidAmount));

                // Overdue
                List<Revenue> overdueRevenues = allRevenues.stream()
                                .filter(r -> "Overdue".equalsIgnoreCase(r.getStatus()))
                                .collect(Collectors.toList());
                double overdueAmount = overdueRevenues.stream()
                                .mapToDouble(r -> r.getTotal() != null ? r.getTotal() : 0.0)
                                .sum();
                financialStats.put("overdue", Map.of("count", overdueRevenues.size(), "amount", overdueAmount));

                stats.put("financials", financialStats);

                return stats;
        }
}
