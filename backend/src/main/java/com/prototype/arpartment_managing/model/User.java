package com.prototype.arpartment_managing.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table( name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, name = "full_name")
    private String fullName;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(name = "phone_number")
    private String phoneNumber;
    private String role;
    @Column(nullable = false, unique = true, name = "citizen_identification")
    private String citizenIdentification;
    @ManyToOne(fetch = FetchType.EAGER )
    @JoinColumn(name = "apartment_id", referencedColumnName = "apartment_id", nullable = false)
    @JsonBackReference // Only this for bidirectional
    private Apartment apartment;

    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent recursion
    private Set<Notification> notifications;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCitizenIdentification() {
        return citizenIdentification;
    }

    public void setCitizenIdentification(String citizenIdentification) {
        this.citizenIdentification = citizenIdentification;
    }
    public Apartment getApartment() {
        return apartment;
    }

    public void setApartment(Apartment apartment) {
        this.apartment = apartment;
    }

    public Set<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(Set<Notification> notifications) {
        this.notifications = notifications;
    }
}