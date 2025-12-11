package com.prototype.arpartment_managing.exception;

public class FeeInUseException extends RuntimeException {
    public FeeInUseException(String message) {
        super(message);
    }
}