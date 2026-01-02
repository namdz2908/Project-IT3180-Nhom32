package com.prototype.arpartment_managing.dto;

import com.prototype.arpartment_managing.exception.ApartmentNotFoundException;
import com.prototype.arpartment_managing.model.Apartment;
import com.prototype.arpartment_managing.model.Invoice;
import com.prototype.arpartment_managing.repository.ApartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;

public class InvoiceDTO {

    private ApartmentRepository apartmentRepository;
    private long id;

    private String apartmentId;

    private String type;

    private String status;

    private double used;

    private double total;

    private LocalDateTime createDate;

    private LocalDateTime endDate;

    private String dueDate; // Thêm ISO string cho frontend

    private String apartmentName; // Thêm Tên căn hộ

    // Constructor without dependencies
    public InvoiceDTO() {
    }

    // Constructor that takes an Invoice and Apartment
    public InvoiceDTO(Invoice invoice, Apartment apartment) {
        this.id = invoice.getId();
        this.type = invoice.getType();
        this.status = invoice.getStatus();
        this.apartmentId = (invoice.getApartment() != null) ? invoice.getApartment().getApartmentId() : null;

        // Calculate used value based on type
        if ("Service".equals(this.type) && apartment != null) {
            this.used = apartment.getArea();
        } else {
            this.used = invoice.getUsed();
        }
        this.total = invoice.getTotal();
        this.createDate = invoice.getCreateDate();
        this.endDate = invoice.getEndDate();

        // THÊM 2 DÒNG NÀY
        this.dueDate = (this.endDate != null) ? this.endDate.toString() : null;
        this.apartmentName = (apartment != null) ? apartment.getApartmentId() : "Unknown";
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
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
