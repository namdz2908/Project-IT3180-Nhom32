package com.prototype.arpartment_managing.exception;

public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(String message) {
        super(message);
    }

    public InvoiceNotFoundException(Long id) {
        super("Invoice not found with id: " + id);
    }
}
