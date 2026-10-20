package com.example.csvprocessor.service;

import com.example.csvprocessor.model.Employee;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvReaderService {

    public List<Employee> readEmployees() throws IOException {

        // Creates an empty list where we'll store all 30 employee objects
        List<Employee> employees = new ArrayList<>();

        // Find and open employees.csv from the resources folder
        InputStream inputStream = getClass()
                .getClassLoader()
                .getResourceAsStream("employees.csv");

        // Check if the CSV file exists
        if (inputStream == null) {
            throw new IOException("employees.csv not found");
        }

        // BufferedReader reads the CSV file line by line
        // try-with-resources automatically closes the reader when finished
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            // reader.readLine() reads the next line
            // Skip the first line because it contains column names, not employee data
            reader.readLine();

            // Store each line read from the CSV file
            String line;

            // line = reader.readLine() stores that line in the variable
            // Keep reading until readLine() returns null (end of file)
            while ((line = reader.readLine()) != null) {

                // Split the line at each comma into an array of Strings
                String[] data = line.split(",");

                // Convert each CSV value string into the correct Java data type
                int id = Integer.parseInt(data[0]);  // String -> int
                String name = data[1];  // Employee name
                double salary = Double.parseDouble(data[2]);  // String -> double
                LocalDate joinedDate = LocalDate.parse(data[3]); // String -> LocalDate
                String role = data[4];  // Employee role
                double projectCompletion = Double.parseDouble(data[5]); // 0.8 = 80%

                // Create an employee object
                Employee employee = new Employee(
                        id, name, salary, joinedDate, role, projectCompletion
                );

                // Add the employee object to the list
                employees.add(employee);
            }

        }

        // Return the list containing all employees read from the CSV file
        return employees;
    }
}
