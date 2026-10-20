package com.example.csvprocessor.service;

import com.example.csvprocessor.model.Employee;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CsvReaderServiceTest {

    // Test that all 30 employees are loaded
    @Test
    void shouldReadAllEmployees() throws IOException {

        // Create an object of CsvReaderService
        CsvReaderService csvReaderService = new CsvReaderService();

        // Read the employees from employees.csv
        List<Employee> employees = csvReaderService.readEmployees();

        // Check that the CSV file contains exactly 30 employees
        assertEquals(30, employees.size());
    }

    // Test Alice's employee details
    // to check whether the CSV reader correctly converts the data types
    @Test
    void shouldReadEmployeeDetailsCorrectly() throws IOException {

        // Create an object of CsvReaderService
        CsvReaderService csvReaderService = new CsvReaderService();

        // Read all employees from the CSV file
        List<Employee> employees = csvReaderService.readEmployees();

        // Get the first employee (Alice)
        Employee alice = employees.get(0);

        // Check Alice's details against the CSV file
        assertEquals(1, alice.getId());
        assertEquals("Alice", alice.getName());
        assertEquals(52000.0, alice.getSalary());
        assertEquals(LocalDate.of(2019, 5, 12), alice.getJoinedDate());
        assertEquals("Employee", alice.getRole());
        assertEquals(0.8, alice.getProjectCompletion());
    }
}
