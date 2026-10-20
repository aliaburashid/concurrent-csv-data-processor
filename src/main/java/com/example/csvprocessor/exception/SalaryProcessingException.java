package com.example.csvprocessor.exception;

public class SalaryProcessingException extends RuntimeException {

    // for errors such as processing timeouts.
    public SalaryProcessingException(String message) {
        super(message);
    }

}