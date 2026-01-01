package com.prototype.arpartment_managing.repository;

import com.prototype.arpartment_managing.model.Revenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RevenueRepository extends JpaRepository<Revenue, Long> {
    Optional<Revenue> findById(Long id);

    List<Revenue> findByApartment_ApartmentId(String apartmentId);

    Optional<Revenue> findByApartment_ApartmentIdAndType(String apartmentId, String type);

    List<Revenue> findByType(String type);

    boolean existsByType(String type);

    long countByType(String type);

    List<Revenue> findByTypeAndStatusIn(String type, List<String> statuses);

    long countByTypeAndStatusNotIn(String type, List<String> statuses);

    Optional<Revenue> findByPaymentToken(String paymentToken);

    @Query("SELECT r FROM Revenue r WHERE r.endDate >= :startDate AND r.endDate <= :endDate AND r.status = 'Unpaid'")
    List<Revenue> findUpcomingDueDates(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT r FROM Revenue r WHERE r.apartment.apartmentId = :apartmentId AND r.endDate >= :startDate AND r.endDate <= :endDate AND r.status = 'Unpaid'")
    List<Revenue> findUpcomingDueDatesByApartment(@Param("apartmentId") String apartmentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

}
