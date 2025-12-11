package com.prototype.arpartment_managing.exception;

public class UserNotFoundExceptionEmail extends RuntimeException{
    public UserNotFoundExceptionEmail(String email){
        super("Could not found user with email: "+email);
    }

}
