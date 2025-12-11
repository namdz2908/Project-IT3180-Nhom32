package com.prototype.arpartment_managing.dto;

import com.prototype.arpartment_managing.exception.ApartmentNotFoundException;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Revenue;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;

public class RevenueDTO {

    private ApartmentRepository apartmentRepository;
    private long id;

    private String apartmentId;

    private String type;

    private String status;

    private double used;

    private double total;
    
    private LocalDateTime createDate;
    
    private LocalDateTime endDate;
    
    // Constructor without dependencies
    public RevenueDTO() {
    }
    
    // Constructor that takes a Revenue and Apartment
    public RevenueDTO(Revenue revenue, Apartment apartment) {
        this.id = revenue.getId();
        this.type = revenue.getType();
        this.status = revenue.getStatus();
        this.apartmentId = (revenue.getApartment() != null) ? revenue.getApartment().getApartmentId() : null;
        
        // Calculate used value based on type
        if ("Service".equals(this.type) && apartment != null) {
            this.used = apartment.getArea();
        } else {
            this.used = revenue.getUsed();
        }
        this.total = revenue.getTotal();
        this.createDate = revenue.getCreateDate();
        this.endDate = revenue.getEndDate();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getUsed() {
        return used;
    }

    public void setUsed(double used) {
        this.used = used;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
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
}
