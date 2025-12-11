package com.prototype.arpartment_managing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "apartments")
public class Apartment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "apartment_id")
    private String apartmentId;

    @Column(name = "floor", nullable = false)
    private Integer floor;
    @Column(name = "area", nullable = false)
    private Float area;
    @Column(name = "apartmentType")
    private String apartmentType;
    @Column(name = "owner")
    private String owner;    
    @Column(name = "occupants")
    private Integer occupants = 0;

    @Column(name = "is_occupied")
    private Boolean isOccupied = false;
    
    @Column(name = "service_usage")
    private Double serviceUsage = 0.0;
    
    @Column(name = "water_usage")
    private Double waterUsage = 0.0;
    
    @Column(name = "electricity_usage")
    private Double electricityUsage = 0.0;
    
    @Column(name = "vehicle_count")
    private Integer vehicleCount = 0;

    @OneToMany(mappedBy = "apartment", cascade = { CascadeType.ALL},
            fetch = FetchType.LAZY, orphanRemoval = false)
    @JsonIgnore
    private List<User> residents;

    @OneToMany(mappedBy = "apartment", cascade = { CascadeType.ALL},
            fetch = FetchType.LAZY, orphanRemoval = false)
    @JsonIgnore
    private List<Revenue> revenues;

    @Column( name = "total" )
    private Double total;

    // Constructors
    public Apartment() {
    }

    public Apartment(String apartmentId){

    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(String apartmentId) {
        this.apartmentId = apartmentId;
    }

    public Integer getFloor() {
        return floor;
    }

    public void setFloor(Integer floor) {
        this.floor = floor;
    }

    public Float getArea() {
        return area;
    }

    public void setArea(Float area) {
        this.area = area;
    }
    public String getApartmentType() {
        return apartmentType;
    }

    public void setApartmentType(String apartmentType) {
        this.apartmentType = apartmentType;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Integer getOccupants() {
        return occupants;
    }

    public void setOccupants(Integer occupants) {
        this.occupants = occupants;
    }

    public Boolean getIsOccupied() {
        return isOccupied;
    }    
    public void setIsOccupied(Boolean isOccupied) {
        this.isOccupied = isOccupied;
    }
    
    public Double getServiceUsage() {
        return serviceUsage;
    }
    
    public void setServiceUsage(Double serviceUsage) {
        this.serviceUsage = serviceUsage;
    }
    
    public Double getWaterUsage() {
        return waterUsage;
    }
    
    public void setWaterUsage(Double waterUsage) {
        this.waterUsage = waterUsage;
    }
    
    public Double getElectricityUsage() {
        return electricityUsage;
    }
    
    public void setElectricityUsage(Double electricityUsage) {
        this.electricityUsage = electricityUsage;
    }
    
    public Integer getVehicleCount() {
        return vehicleCount;
    }
    
    public void setVehicleCount(Integer vehicleCount) {
        this.vehicleCount = vehicleCount;
    }
    
    public List<User> getResidents() {
        return residents;
    }

    public void setResidents(List<User> residents) {
        this.residents = residents;
    }

    public List<Revenue> getRevenues() {
        return revenues;
    }

    public Revenue getRevenueById(String id){
        for(Revenue rev : revenues){
            if(rev.getId().toString().equals(id)){
                return rev;
            }
        }
        return null;
    }

    public void setRevenues(List<Revenue> revenues) {
        this.revenues = revenues;
    }

    public Double getTotal() {
        return total;
    }

    public void setTotal(Double total) {
        this.total = total;
    }

    public List<Revenue> getRevenueWithStatusOrId(String status, String id) {
        System.out.println("status is " + status);
        System.out.println("id is " + id);
        List<Revenue> revenues = new ArrayList<Revenue>();
        if(status != null){
            for(Revenue revenue : this.getRevenues()){
                if(revenue.getStatus().equals(status)){
                    revenues.add(revenue);
                }
            }
        }
        else {
            List<Revenue> re = this.getRevenues();
            Revenue revenue = null;
            for(Revenue rev : re){
                if(rev.getId().toString().equals(id)){
                    revenue = rev;
                    break;
                }
            }
            if(revenue == null){
                System.out.print("NULL ROI CHAY LAM GI NUA: ");
                return null;
            }
            revenues.add(revenue);
        }

        return revenues;
    }
}