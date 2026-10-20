package com.example.csvprocessor.service;

import com.example.csvprocessor.model.Employee;
import com.example.csvprocessor.exception.InvalidEmployeeRoleException;

import org.junit.jupiter.api.Test;

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
}
