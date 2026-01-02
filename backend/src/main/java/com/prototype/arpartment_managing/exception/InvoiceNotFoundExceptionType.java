package com.prototype.arpartment_managing.exception;

public class InvoiceNotFoundExceptionType extends RuntimeException {
    public InvoiceNotFoundExceptionType(String type) {

        super("Could not found invoice that have" + type);
    }
}
