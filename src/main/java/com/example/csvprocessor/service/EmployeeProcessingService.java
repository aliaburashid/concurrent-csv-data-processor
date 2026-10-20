package com.example.csvprocessor.service;

import com.example.csvprocessor.exception.SalaryProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.example.csvprocessor.model.Employee;

import java.util.ArrayList;
import java.util.List;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

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

        // example: Imagine our counter is currently 5.
        // Two threads finish calculating salaries at almost the same time.
        // With a normal int:
        // Thread 1	                         Thread 2
        // Reads counter = 5	        Reads counter = 5
        // Calculates 5 + 1	            Calculates 5 + 1
        // Writes 6	                    Writes 6
        // Final counter = 6 (incorrect!)
        // But two employees actually finished, so the counter should be 7.
        // With AtomicInteger: Final counter = 7 (correct!)
        // Each increment happens atomically, so no updates are lost.
        AtomicInteger processedEmployeeCount = new AtomicInteger(0);

        // Count how many employees failed to process
        AtomicInteger failedEmployeeCount = new AtomicInteger(0);

        // Store updated employee records for the final CSV report
        List<String> updatedEmployeeRecords = new ArrayList<>();

        // Protect the shared results list from concurrent modifications
        ReentrantLock salaryResultsLock = new ReentrantLock();

        // Submit each employee salary calculation to the thread pool
        for (Employee employee : employeesToProcess) {

            salaryThreadPool.execute(() -> {

                try {
                    // Calculate the employees new salary
                    double updatedSalary = employeeSalaryCalculator.calculateNewSalary(employee);

                    // Acquire the lock before modifying the shared results list
                    salaryResultsLock.lock();

                    try {
                        // Store the employees updated salary for CSV export
                        updatedEmployeeRecords.add(employee.getId() + "," +
                                        employee.getName() + "," +
                                        updatedSalary
                        );

                    } finally {
                        // Always release the lock so another thread can access the list
                        salaryResultsLock.unlock();
                    }

                    // Display the result
                    System.out.println(employee.getName() + " - New Salary: " + updatedSalary);

                    // Increase the counter after a successful salary calculation
                    processedEmployeeCount.incrementAndGet();

                } catch (Exception e) {
                    // Count failed salary calculations separately from successful ones
                    failedEmployeeCount.incrementAndGet();

                    // Identify the employee whose salary could not be calculated
                    System.err.println("Failed to process employee " + employee.getName() + ": " + e.getMessage());

                    // Stop processing if any employees salary calculation failed
                    // This prevents an incomplete set of results from being treated as successful
                    if (failedEmployeeCount.get() > 0) {
                        throw new SalaryProcessingException(
                                "Salary processing failed for " + failedEmployeeCount.get() + " employees"
                        );
                    }
                }
            });
        }

        // Stop accepting new tasks after submitted tasks finish
        salaryThreadPool.shutdown();

        try {
            // Wait up to 1 minute for all submitted salary calculation tasks to finish
            // shutdown() stops new tasks from being accepted but does not wait for completion
            boolean allTasksFinished = salaryThreadPool.awaitTermination(1, TimeUnit.MINUTES);

            // Prevent reporting incomplete results if some threads are still running
            if (!allTasksFinished) {
                throw new SalaryProcessingException("Salary processing timed out");
            }

            // Only employees whose salary calculations completed successfully are counted
            System.out.println("Successfully processed employees: " + processedEmployeeCount.get());

            // failure employee are counted
            System.out.println("Failed employees: " + failedEmployeeCount.get());

        } catch (InterruptedException e) {
            // Restore the interrupted status so other parts of the application
            // can detect that this thread was interrupted
            Thread.currentThread().interrupt();
            // reports that salary processing could not finish normally
            throw new SalaryProcessingException("Salary processing was interrupted");
        }
    }
}
