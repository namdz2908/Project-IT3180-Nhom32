package com.prototype.arpartment_managing.repository;

import com.prototype.arpartment_managing.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findById(Long id);

    List<Invoice> findByApartment_ApartmentId(String apartmentId);

    Optional<Invoice> findByApartment_ApartmentIdAndType(String apartmentId, String type);

    List<Invoice> findByType(String type);

    boolean existsByType(String type);

    long countByType(String type);

    List<Invoice> findByTypeAndStatusIn(String type, List<String> statuses);

    long countByTypeAndStatusNotIn(String type, List<String> statuses);

    Optional<Invoice> findByPaymentToken(String paymentToken);

    @Query("SELECT i FROM Invoice i WHERE i.endDate >= :startDate AND i.endDate <= :endDate AND i.status = 'Unpaid'")
    List<Invoice> findUpcomingDueDates(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT i FROM Invoice i WHERE i.apartment.apartmentId = :apartmentId AND i.endDate >= :startDate AND i.endDate <= :endDate AND i.status = 'Unpaid'")
    List<Invoice> findUpcomingDueDatesByApartment(@Param("apartmentId") String apartmentId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

}
