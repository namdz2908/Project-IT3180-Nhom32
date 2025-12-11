package com.prototype.arpartment_managing.security;

import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {

    @Autowired
    private UserRepository userRepository;

    /**
     * Check if the current user matches the given user ID
     */
    public boolean isCurrentUser(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> user.getId().equals(id))
                .orElse(false);
    }

    /**
     * Check if the current user is a resident of the given apartment
     */
    public boolean isResidentOfApartment(String apartmentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getApartment() == null) {
                        return false;
                    }
                    return user.getApartment().getApartmentId().equals(apartmentId);
                })
                .orElse(false);
    }
}