package com.prototype.arpartment_managing.dto;

import java.util.List;

public class ApartmentDTO {
    private String apartmentId;
    private Integer floor;
    private Float area;
    private String owner;
    private Boolean isOccupied;
    private Integer occupants;
    private List<String> residentUsernames;
    private List<Long> revenueIds;

    public ApartmentDTO() {}

    public ApartmentDTO(String apartmentId, Integer floor, Float area, String owner, Boolean isOccupied,
                        Integer occupants, List<String> residentUsernames, List<Long> revenueIds) {
        this.apartmentId = apartmentId;
        this.floor = floor;
        this.area = area;
        this.owner = owner;
        this.isOccupied = isOccupied;
        this.occupants = occupants;
        this.residentUsernames = residentUsernames;
        this.revenueIds = revenueIds;
    }

    // Getters and Setters
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

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Boolean getIsOccupied() {
        return isOccupied;
    }

    public void setIsOccupied(Boolean isOccupied) {
        this.isOccupied = isOccupied;
    }

    public Integer getOccupants() {
        return occupants;
    }

    public void setOccupants(Integer occupants) {
        this.occupants = occupants;
    }

    public List<String> getResidentUsernames() {
        return residentUsernames;
    }

    public void setResidentUsernames(List<String> residentUsernames) {
        this.residentUsernames = residentUsernames;
    }

    public List<Long> getRevenueIds() {
        return revenueIds;
    }

    public void setRevenueIds(List<Long> revenueIds) {
        this.revenueIds = revenueIds;
    }
}
