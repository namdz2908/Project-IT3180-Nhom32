package com.prototype.arpartment_managing.repository;

import com.prototype.arpartment_managing.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApartmentRepository extends JpaRepository<Apartment,Long> {
    Optional<Apartment> findByApartmentId(String apartmentId);
    public abstract boolean existsByApartmentId(String apartmentId);
    public abstract void deleteByApartmentId(String apartmentId);
}