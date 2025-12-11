package com.prototype.arpartment_managing.exception;

public class ApartmentNotFoundException extends RuntimeException{
    public ApartmentNotFoundException(String apartmentId){
        super("Could not found apartment with number "+apartmentId);
    }
}