package com.prototype.arpartment_managing.repository;

import com.prototype.arpartment_managing.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Optional<Notification> findByType(String type);
    List<Notification> findByUsersId(Long userId);
}
