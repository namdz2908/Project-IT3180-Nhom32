package com.prototype.arpartment_managing.exception;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(Long id){
        super("Could not found user with id "+id);
    }

    public UserNotFoundException(String s){
        super("Could not found user with ussername"+s);
    }
}
