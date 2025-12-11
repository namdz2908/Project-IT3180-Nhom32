package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.exception.ApartmentNotFoundException;
import com.prototype.arpartment_managing.exception.UserNotFoundException;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class ApartmentResidentService {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Adds a user to an apartment's resident list
     */
    @Transactional
    public void addResidentToApartment(Long userId, String apartmentId) {
        // Find the apartment
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));

        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // If user already has an apartment, remove from previous apartment's resident list
        if (user.getApartment() != null && !user.getApartment().getApartmentId().equals(apartmentId)) {
            removeUserFromPreviousApartment(user);
            // Refresh user after removal
            user = userRepository.findById(userId).get();
        }

        // Set the apartment for the user
        user.setApartment(apartment);
        userRepository.save(user);
        // Refresh user after save
        user = userRepository.findById(userId).get();

        // Refresh apartment to ensure we have latest data
        apartment = apartmentRepository.findByApartmentId(apartmentId).get();

        // Update apartment occupancy information
        if (apartment.getResidents() == null) {
            apartment.setResidents(new ArrayList<>());
        }

        // Only add if the user isn't already in the list
        if (!apartment.getResidents().contains(user)) {
            apartment.getResidents().add(user);
            apartment.setOccupants(apartment.getResidents().size());
            apartment.setIsOccupied(true);
        }

        apartmentRepository.save(apartment);
    }

    /**
     * Removes a user from an apartment's resident list
     */
    @Transactional
    public void removeResidentFromApartment(Long userId, String apartmentId) {
        // Find the apartment

        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));

        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Check if user is assigned to this apartment
        if (user.getApartment() == null || !user.getApartment().getApartmentId().equals(apartmentId)) {
            throw new IllegalStateException("User is not assigned to apartment " + apartmentId);
        }

        // Remove apartment assignment from user
        user.setApartment(null);
        userRepository.save(user);
        // Refresh user
        user = userRepository.findById(userId).get();

        // Refresh apartment
        apartment = apartmentRepository.findByApartmentId(apartmentId).get();

        // Update apartment's resident list
        if (apartment.getResidents() != null) {
            apartment.getResidents().remove(user);
            apartment.setOccupants(apartment.getResidents().size());
            apartment.setIsOccupied(!apartment.getResidents().isEmpty());
        }

        apartmentRepository.save(apartment);
    }

    /**
     * Updates user apartment assignment and maintains consistency
     */
    @Transactional
    public void updateUserApartmentAssignment(User user) {
        // If user has apartment, remove from any previous apartment
        if (user.getApartment() == null) {
            Long userId = user.getId();
            User existingUser = userRepository.findById(user.getId())
                    .orElseThrow(() -> new UserNotFoundException(userId));

            if (existingUser.getApartment() != null) {
                removeUserFromPreviousApartment(existingUser);
            }
            return;
        }

        // If user has an apartment, add to that apartment's resident list
        String apartmentId = user.getApartment().getApartmentId();
        Apartment apartment = apartmentRepository.findByApartmentId(apartmentId)
                .orElseThrow(() -> new ApartmentNotFoundException(apartmentId));

        // Check if user already in a different apartment
        Long userId = user.getId();
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (existingUser.getApartment() != null &&
                !existingUser.getApartment().getApartmentId().equals(apartmentId)) {
            removeUserFromPreviousApartment(existingUser);
        }

        // Refresh user and apartment
        user = userRepository.findById(user.getId()).get();
        apartment = apartmentRepository.findByApartmentId(apartmentId).get();

        // Update apartment resident list
        if (apartment.getResidents() == null) {
            apartment.setResidents(new ArrayList<>());
        }

        if (!apartment.getResidents().contains(user)) {
            apartment.getResidents().add(user);
            apartment.setOccupants(apartment.getResidents().size());
            apartment.setIsOccupied(true);
            apartmentRepository.save(apartment);
        }
    }

    /**
     * Helper method to remove a user from their previous apartment
     */
    private void removeUserFromPreviousApartment(User user) {
        if (user.getApartment() != null) {
            Apartment previousApartment = user.getApartment();

            // Refresh apartment to ensure we have latest data
            previousApartment = apartmentRepository.findByApartmentId(previousApartment.getApartmentId()).get();

            if (previousApartment.getResidents() != null) {
                previousApartment.getResidents().remove(user);
                previousApartment.setOccupants(previousApartment.getResidents().size());
                previousApartment.setIsOccupied(!previousApartment.getResidents().isEmpty());
                apartmentRepository.save(previousApartment);
            }
        }
    }

    @Transactional
    public void addResidentToApartmentByCitizenIdentification(String citizenIdentificaition, String apartmentId) {
        Optional<User> user = userRepository.findByCitizenIdentification(citizenIdentificaition);
        addResidentToApartment(user.get().getId(), apartmentId);
    }

    @Transactional
    public void removeResidentFromApartmentByCitizenIdentification(String citizenIdentificaition, String apartmentId) {
        Optional<User> user = userRepository.findByCitizenIdentification(citizenIdentificaition);
        removeResidentFromApartment(user.get().getId(), apartmentId);
    }
}