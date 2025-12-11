package com.prototype.arpartment_managing.exception;

public class UserNotFoundExceptionUsername extends RuntimeException{
    public UserNotFoundExceptionUsername(String username){
        super("Could not found user with email: "+username);
    }

}
