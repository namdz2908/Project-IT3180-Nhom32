package com.prototype.arpartment_managing.exception;

public class NotificationNotFoundTypeException extends RuntimeException{
    public NotificationNotFoundTypeException(String type) {

        super("Could not found revenue with type " + type);
    }
}
