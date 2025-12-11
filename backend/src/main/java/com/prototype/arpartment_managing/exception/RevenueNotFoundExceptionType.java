package com.prototype.arpartment_managing.exception;

public class RevenueNotFoundExceptionType extends RuntimeException {
    public RevenueNotFoundExceptionType(String type) {

        super("Could not found revenue that have" + type);
    }
}
