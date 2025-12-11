package com.prototype.arpartment_managing.service;

import com.prototype.arpartment_managing.dto.NotificationDTO;
import com.prototype.arpartment_managing.exception.NotificationNotFoundException;
import com.prototype.arpartment_managing.exception.NotificationNotFoundTypeException;
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
import java.util.stream.Collectors;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));
        return toDTO(notification);
    }

    public NotificationDTO getNotificationByType(String type) {
        Notification notification = notificationRepository.findByType(type)
                .orElseThrow(() -> new NotificationNotFoundTypeException(type));
        return toDTO(notification);
    }

    @Transactional
    public NotificationDTO createNotification(NotificationDTO dto) {
        Notification notification = new Notification();
        notification.setTitle(dto.getTitle());
        notification.setContent(dto.getContent());
        notification.setType(dto.getType());
        notification.setCreatedAt(dto.getCreatedAt());

        Set<User> users = getUsersByUsernames(dto.getUsernames());
        notification.setUsers(users);

        Notification saved = notificationRepository.save(notification);
        return toDTO(saved);
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        notification.getUsers().forEach(user -> user.getNotifications().remove(notification));
        notification.getUsers().clear();
        notificationRepository.save(notification);
        notificationRepository.delete(notification);
    }

    @Transactional
    public void deleteNotiUser(Long id, Long userId) {
        Notification notification = notificationRepository
                .findById(id).orElseThrow(() -> new NotificationNotFoundException(id));
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        user.getNotifications().remove(notification);
        notification.getUsers().remove(user);
        notificationRepository.save(notification);
    }

    @Transactional
    public NotificationDTO updateNotification(Long id, NotificationDTO dto) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException(id));

        notification.setTitle(dto.getTitle());
        notification.setContent(dto.getContent());
        notification.setType(dto.getType());

        Set<User> users = getUsersByUsernames(dto.getUsernames());
        notification.getUsers().forEach(user -> user.getNotifications().remove(notification));
        notification.setUsers(users);

        Notification saved = notificationRepository.save(notification);
        return toDTO(saved);
    }

    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUsersId(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // DTO to Entity mapping helpers
    private Set<User> getUsersByUsernames(Set<String> usernames) {
        if (usernames == null) return new HashSet<>();
        return usernames.stream()
                .map(username -> userRepository.findByUsername(username)
                        .orElseThrow(() -> new UserNotFoundException(username)))
                .collect(Collectors.toSet());
    }

    private NotificationDTO toDTO(Notification notification) {
//        List<String> usernames = notification.getUsers()
////                .stream().map(User::getUsername).collect(Collectors.toList());
////
////        return new NotificationDTO(
////                notification.getId(),
////                notification.getTitle(),
////                notification.getContent(),
////                notification.getType(),
////                notification.getCreatedAt(),
////                usernames
////        );
        return new NotificationDTO(notification);
    }
}
