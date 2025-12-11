package com.prototype.arpartment_managing.dto;

import com.prototype.arpartment_managing.model.Notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class NotificationDTO {

    private Long id;
    private String title;
    private String content;
    private String type;
    private LocalDateTime createdAt;
    private Set<String> usernames;

    // Constructor mặc định
    public NotificationDTO() {}

    // Constructor chuyển từ entity Notification sang DTO
    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.title = notification.getTitle();
        this.content = notification.getContent();
        this.type = notification.getType();
        this.createdAt = notification.getCreatedAt();
        this.usernames = notification.getUsers().stream()
                .map(user -> user.getUsername())
                .collect(Collectors.toSet());
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Set<String> getUsernames() {
        return usernames;
    }

    public void setUsernames(Set<String> usernames) {
        this.usernames = usernames;
    }
}
