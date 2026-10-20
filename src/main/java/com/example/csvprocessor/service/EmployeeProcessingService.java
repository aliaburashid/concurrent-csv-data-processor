package com.example.csvprocessor.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class EmployeeProcessingService {

    public void processEmployees() {

        // ExecutorService manages threads for us, rather than creating each thread manually
        // Create a thread pool containing 4 worker threads
        ExecutorService executor = Executors.newFixedThreadPool(4);


        // Stop accepting new tasks after submitted tasks finish
        executor.shutdown();
    }
}
