package com.prototype.arpartment_managing.model;

import jakarta.persistence.*;

@Entity
@Table(name = "Fees")
public class Fee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "type")
    private String type; // Loại phí

    @Column(nullable = false,name = "price_per_unit")
    private double pricePerUnit; // Giá tiền mỗi đơn vị tiêu thụ

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(double pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }
}
