package com.example.csvprocessor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.csvprocessor.model.Employee;
import java.util.List;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

@Service
// for fields declared final
@RequiredArgsConstructor
public class EmployeeProcessingService {

    // service responsible for reading employees from the CSV file
    private final CsvReaderService employeeCsvReader;

    // Service responsible for calculating employee salary increases
    private final SalaryCalculationService employeeSalaryCalculator;

    public void calculateEmployeeSalariesConcurrently() throws IOException {

        // Read all employees from the CSV file
        List<Employee> employeesToProcess = employeeCsvReader.readEmployees();

        // ExecutorService manages threads for us, rather than creating each thread manually
        // Create a thread pool containing 4 worker threads
        ExecutorService salaryThreadPool = Executors.newFixedThreadPool(4);

        // Count how many employees have been processed successfully
        // why not a normal counter? because Multiple threads can interfere with one another, causing some increments to be lost
        // AtomicInteger performs the increment atomically, making it safe for multiple threads
        AtomicInteger processedEmployeeCount = new AtomicInteger(0);

        // Submit each employee salary calculation to the thread pool
        for (Employee employee : employeesToProcess) {

            salaryThreadPool.execute(() -> {

                // Calculate the employees new salary
                double updatedSalary = employeeSalaryCalculator.calculateNewSalary(employee);

                // Display the result
                System.out.println(employee.getName() + " - New Salary: " + updatedSalary);

                // Increase the counter after a successful salary calculation
                // increment and return the result
                processedEmployeeCount.incrementAndGet();
            });

        // Stop accepting new tasks after submitted tasks finish
        salaryThreadPool.shutdown();
    }
}
