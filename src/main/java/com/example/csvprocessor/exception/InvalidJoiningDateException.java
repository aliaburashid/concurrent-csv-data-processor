package com.example.csvprocessor.exception;

// Exception to handle employees with missing or future joining dates
public class InvalidJoiningDateException extends RuntimeException {

    public InvalidJoiningDateException(String message) {
        super(message);
    }
}