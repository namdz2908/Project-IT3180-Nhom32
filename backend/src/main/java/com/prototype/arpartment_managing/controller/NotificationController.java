package com.prototype.arpartment_managing.controller;

import com.prototype.arpartment_managing.dto.NotificationDTO;
import com.prototype.arpartment_managing.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin("http://localhost:5000")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<NotificationDTO> getAll() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationDTO getById(@PathVariable Long id) {
        return notificationService.getNotificationById(id);
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationDTO getByType(@PathVariable String type) {
        return notificationService.getNotificationByType(type);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationDTO create(@RequestBody NotificationDTO dto) {
        return notificationService.createNotification(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public NotificationDTO update(@PathVariable Long id, @RequestBody NotificationDTO dto) {
        return notificationService.updateNotification(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted");
    }

    @GetMapping("/user/{userId}")
    public List<NotificationDTO> getByUser(@PathVariable Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @DeleteMapping("/user/{id}/{userId}")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNoti(@PathVariable Long id, @PathVariable Long userId) {
        notificationService.deleteNotiUser(id, userId);
        return ResponseEntity.ok("Notification deleted");
    }
}
