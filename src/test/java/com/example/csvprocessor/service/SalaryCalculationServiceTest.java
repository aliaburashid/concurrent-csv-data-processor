package com.example.csvprocessor.service;

import com.example.csvprocessor.model.Employee;
import com.example.csvprocessor.exception.InvalidEmployeeRoleException;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class SalaryCalculationServiceTest {

    // Test invalid employee
    @Test
    void shouldThrowExceptionForInvalidRole() {

        // Create an employee with an invalid role
        Employee employee = new Employee();
        employee.setRole("Doctor");

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Verify that custom exception is thrown
        assertThrows(InvalidEmployeeRoleException.class, () -> {
            // Calls the method and checks the employee role
            salaryService.getRoleIncrease(employee);
        });
    }

    // Test null and blank roles
    @Test
    void shouldThrowExceptionForMissingRole() {

        // Create an employee without a role
        Employee employee = new Employee();
        employee.setRole(null);

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Check that a missing role throws our custom exception
        assertThrows(InvalidEmployeeRoleException.class, () -> {
            salaryService.getRoleIncrease(employee);
        });
    }

    // Test valid role percentages
    @Test
    void shouldReturnCorrectIncreaseForDirector() {

        // Create an employee with the Director role
        Employee employee = new Employee();
        employee.setRole("Director");

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Directors should receive a 5% role-based increase
        assertEquals(0.05, salaryService.getRoleIncrease(employee));
    }

    // Test valid role percentages
    @Test
    void shouldReturnCorrectIncreaseForManager() {

        // Create an employee with the Manager role
        Employee employee = new Employee();
        employee.setRole("Manager");

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Managers should receive a 2% role-based increase
        assertEquals(0.02, salaryService.getRoleIncrease(employee));
    }

    // Test valid role percentages
    @Test
    void shouldReturnCorrectIncreaseForEmployee() {

        // Create an employee with the Employee role
        Employee employee = new Employee();
        employee.setRole("Employee");

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Employees should receive a 1% role-based increase
        assertEquals(0.01, salaryService.getRoleIncrease(employee));
    }

    // Test years of service
    @Test
    void shouldCalculateYearsOfServiceIncrease() {

        // Create an employee
        Employee employee = new Employee();

        // Employee joined exactly 3 years ago
        // creates a joining date exactly three years before today
        employee.setJoinedDate(LocalDate.now().minusYears(3));

        // Create salary calculation service
        SalaryCalculationService salaryService = new SalaryCalculationService();

        // 3 completed years × 2% = 6%
        // delta is a small tolerance for comparing double values
        assertEquals(0.06, salaryService.getYearsOfServiceIncrease(employee), 0.000001);
    }

    // Test the final salary calculation
    @Test
    void shouldCalculateFinalSalaryCorrectly() {

        // Create an employee
        Employee employee = new Employee();

        employee.setSalary(50000.0);
        employee.setRole("Manager");
        employee.setJoinedDate(LocalDate.now().minusYears(3));
        employee.setProjectCompletion(0.9);

        SalaryCalculationService salaryService = new SalaryCalculationService();

        // Calculate the final salary
        double newSalary = salaryService.calculateNewSalary(employee);

        // Check the expected salary
        assertEquals(56000.0, newSalary, 0.000001);
    }
}
