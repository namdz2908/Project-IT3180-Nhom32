package com.prototype.arpartment_managing.exception;

public class NotificationNotFoundException extends RuntimeException{
    public NotificationNotFoundException(long id) {

        super("Could not found notification with id " + id);
    }
}
