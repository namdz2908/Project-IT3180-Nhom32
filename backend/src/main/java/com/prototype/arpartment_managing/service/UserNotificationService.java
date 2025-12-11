package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.exception.NotificationNotFoundException;
import com.prototype.arpartment_managing.exception.UserNotFoundException;
import com.prototype.arpartment_managing.model.Notification;
import com.prototype.arpartment_managing.model.User;
import com.prototype.arpartment_managing.repository.NotificationRepository;
import com.prototype.arpartment_managing.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserNotificationService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public ResponseEntity<?> addNotificationToUsersByRole(Long notificationId, String role) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(notificationId));

        List<User> users = userRepository.findByRole(role);
        if (users.isEmpty()) {
            return ResponseEntity.badRequest().body("No users found with role: " + role);
        }

        users.forEach(user -> {
            user.getNotifications().add(notification);
            notification.getUsers().add(user);
        });

        notificationRepository.save(notification);
        return ResponseEntity.ok("Notification added to users with role: " + role);
    }

    public Set<Notification> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return user.getNotifications();
    }
}
