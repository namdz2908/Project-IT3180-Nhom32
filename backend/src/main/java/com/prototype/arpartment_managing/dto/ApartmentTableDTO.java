package com.prototype.arpartment_managing.dto;

public class ApartmentTableDTO {
    private String apartmentId;
    private Integer floor;
    private Integer occupants;
    private Float area;
    private String apartmentType;

    public ApartmentTableDTO() {}

    public ApartmentTableDTO(String apartmentId, Integer floor, Integer occupants, Float area, String apartmentType) {
        this.apartmentId = apartmentId;
        this.floor = floor;
        this.occupants = occupants;
        this.area = area;
        this.apartmentType = apartmentType;
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

    public Integer getOccupants() {
        return occupants;
    }

    public void setOccupants(Integer occupants) {
        this.occupants = occupants;
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
}
