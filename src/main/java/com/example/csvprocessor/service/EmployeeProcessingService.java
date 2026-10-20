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

    // Service responsible for calculating employee salary increases
    private final SalaryCalculationService employeeSalaryCalculator;

    public void calculateEmployeeSalariesConcurrently() throws IOException {

        // Read all employees from the CSV file
        List<Employee> employeesToProcess = employeeCsvReader.readEmployees();

        // ExecutorService manages threads for us, rather than creating each thread manually
        // Create a thread pool containing 4 worker threads
        ExecutorService salaryThreadPool = Executors.newFixedThreadPool(4);

        // Submit each employee as a separate task
        // go through each employee in the list
        for (Employee employee : employeesToProcess) {

            // send a task to the worker thread
            salaryThreadPool.submit(() -> {

                // Calculate the new salary
                double updatedSalary = employeeSalaryCalculator.calculateNewSalary(employee);

                // Print the result
                System.out.println(employee.getName() + " - New Salary: " + updatedSalary);
            });
        }




        // Stop accepting new tasks after submitted tasks finish
        salaryThreadPool.shutdown();
    }
}
