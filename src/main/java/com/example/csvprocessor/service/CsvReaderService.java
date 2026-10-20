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


        }

        // Returns our list of employees
        return employees;
    }
}
