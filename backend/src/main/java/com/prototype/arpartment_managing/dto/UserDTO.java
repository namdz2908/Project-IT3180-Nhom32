package com.prototype.arpartment_managing.dto;
import com.prototype.arpartment_managing.model.User;

public class UserDTO {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phoneNumber;
    private String role;
    private String citizenIdentification;
    private String password;
    private String apartmentId;

    public UserDTO() {}
    public UserDTO(User user) {
        this.id = user.getId();
        this.fullName = user.getFullName();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.phoneNumber = user.getPhoneNumber();
        this.role = user.getRole();
        this.citizenIdentification = user.getCitizenIdentification();
        this.password = user.getPassword();
        this.apartmentId = (user.getApartment() != null) ? user.getApartment().getApartmentId() : null;
    }

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

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}