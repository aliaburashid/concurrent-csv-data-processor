package com.example.csvprocessor.exception;

// Custom exception for invalid employee roles
public class InvalidEmployeeRoleException extends RuntimeException {

    public InvalidEmployeeRoleException(String message) {
        super(message);
    }
}