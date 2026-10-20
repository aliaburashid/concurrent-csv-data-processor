package com.example.csvprocessor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.csvprocessor.model.Employee;
import java.util.List;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
// for fields declared final
@RequiredArgsConstructor
public class EmployeeProcessingService {

    // service responsible for reading employees from the CSV file
    private final CsvReaderService employeeCsvReader;

    public void calculateEmployeeSalariesConcurrently() throws IOException {

        // Read all employees from the CSV file
        List<Employee> employeesToProcess = employeeCsvReader.readEmployees();

        // ExecutorService manages threads for us, rather than creating each thread manually
        // Create a thread pool containing 4 worker threads
        ExecutorService salaryThreadPool = Executors.newFixedThreadPool(4);


        // Stop accepting new tasks after submitted tasks finish
        salaryThreadPool.shutdown();
    }
}
