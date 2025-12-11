package com.prototype.arpartment_managing.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Revenues")
public class Revenue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "type")
    private String type;

    @Column(nullable = false, name = "status")
    private String status;

    @Column(nullable = false, name = "used")
    private double used;

    @Column(name = "total")
    private Double total;

    @Column(nullable = false, name = "create_date", updatable = false)
    private LocalDateTime createDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable = true, name = "paid_date")
    private LocalDateTime paidDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "apartment_id", referencedColumnName = "apartment_id")
    @JsonBackReference
    private Apartment apartment;

    @Column(name = "payment_token", unique = true)
    private String paymentToken;

    // Constructor to set createDate automatically
    public Revenue() {
        this.createDate = LocalDateTime.now();
        this.status = "Unpaid"; // Default status
    }

    @PrePersist
    protected void onCreate() {
        if (createDate == null) {
            createDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "Unpaid";
        }
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getUsed() {
        return used;
    }

    public void setUsed(double used) {
        this.used = used;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public Apartment getApartment() {
        return apartment;
    }

    public void setApartment(Apartment apartment) {
        this.apartment = apartment;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getPaidDate() {
        return paidDate;
    }
    public void setPaidDate(LocalDateTime paidDate) {
        this.paidDate = paidDate;
    }

    public String getPaymentToken() {
        return paymentToken;
    }

    public void setPaymentToken(String paymentToken) {
        this.paymentToken = paymentToken;
    }

    // Method to check if revenue is overdue
    public boolean isOverdue() {
        return endDate != null && 
               LocalDateTime.now().isAfter(endDate) && 
               "Unpaid".equals(status);
    }

    // Method to update status based on payment and due date
    public void updateStatus() {
        // If already paid, keep it paid
        if ("Paid".equals(status)) {
            return;
        }

        // If unpaid and past end date, mark as overdue
        if (endDate != null && LocalDateTime.now().isAfter(endDate)) {
            status = "Overdue";
        }
    }
}
