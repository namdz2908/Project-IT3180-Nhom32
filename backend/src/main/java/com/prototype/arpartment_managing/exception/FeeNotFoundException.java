package com.prototype.arpartment_managing.exception;

public class FeeNotFoundException extends RuntimeException {
    public FeeNotFoundException(String type) {

        super("Could not found fee with type " + type);
    }
}
