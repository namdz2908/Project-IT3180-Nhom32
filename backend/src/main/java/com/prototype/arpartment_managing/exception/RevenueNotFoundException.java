package com.prototype.arpartment_managing.exception;

public class RevenueNotFoundException extends RuntimeException {
    public RevenueNotFoundException(String message) {
        super(message);
    }

    public RevenueNotFoundException(Long id) {
        super("Revenue not found with id: " + id);
    }
}
