package com.example.csvprocessor.service;

import com.example.csvprocessor.model.Employee;
import org.springframework.stereotype.Service;

import com.example.csvprocessor.exception.InvalidEmployeeRoleException;
import com.example.csvprocessor.exception.InvalidJoiningDateException;

import java.time.LocalDate;
import java.time.Period;

@Service
public class SalaryCalculationService {

    // Check if an employee qualifies for a salary increase
    // If an employee completed less than 60% of their projects,
    // they will NOT receive a salary increase
    public boolean isEligibleForRaise(Employee employee) {
        // 0.6 represents 60% project completion
        return employee.getProjectCompletion() >= 0.6;
    }

    // Get the salary increase percentage based on employee role
    public double getRoleIncrease(Employee employee) {

        // Get the employees role from the Employee object
        String role = employee.getRole();

        // Check if the role is missing or empty
        if (role == null || role.isBlank()) {
            throw new InvalidEmployeeRoleException("Employee role cannot be empty");
        }

        // If the employee is a Director, salary increase is 5%
        if (role.equalsIgnoreCase("Director")) {
            return 0.05;
            // If the employee is a Manager, salary increase is 2%
        } else if (role.equalsIgnoreCase("Manager")) {
            return 0.02;
            // If the employee is a just an Employee, salary increase is 1%
        } else if (role.equalsIgnoreCase("Employee")) {
            return 0.01;
        }

        // Reject any role that is not supported
        throw new InvalidEmployeeRoleException("Invalid employee role: " + role);
    }

    // Calculate salary increase based on completed years of service
    public double getYearsOfServiceIncrease(Employee employee) {

        // Get the date when the employee joined
        LocalDate joinedDate = employee.getJoinedDate();

        // Get today's date
        LocalDate today = LocalDate.now();

        // Check if the joining date is missing
        if (joinedDate == null) {
            throw new InvalidJoiningDateException("Joining date cannot be null");
        }

        // Check if the joining date is in the future
        if (joinedDate.isAfter(today)) {
            throw new InvalidJoiningDateException("Joining date cannot be in the future");
        }

        // Number of completed years
        // Period.between(joinedDate, today): calculates the difference between two dates in years, months and days
        // .getYears() extracts the number of completed years
        int yearsOfService = Period.between(joinedDate, today).getYears();

        // Each completed year adds 2% to the salary increase
        return yearsOfService * 0.02;
    }


    // Get the performance bonus multiplier based on project completion
    public double getPerformanceBonusMultiplier(Employee employee) {

        // Employees above 80% completion receive a 1.5x multiplier
        if (employee.getProjectCompletion() > 0.8) {
            // increase salary by 50%
            return 1.5;
        }

        // Otherwise, the salary increase remains unchanged
        return 1.0;
    }


    // Calculate the employees final salary after applying all raise rules
    public double calculateNewSalary(Employee employee) {

        // Employees below 60% completion receive no salary increase
        if (!isEligibleForRaise(employee)) {
            // return their original salary immediately
            return employee.getSalary();
        }

        // Calculate salary increase percentages
        double roleIncrease = getRoleIncrease(employee);
        double yearsIncrease = getYearsOfServiceIncrease(employee);

        // Add the percentages
        double totalIncrease = roleIncrease + yearsIncrease;

        // Apply the performance bonus multiplier
        double bonusMultiplier = getPerformanceBonusMultiplier(employee);
        totalIncrease = totalIncrease * bonusMultiplier;

        // Calculate how much money to add
        double increaseAmount = employee.getSalary() * totalIncrease;

        // Calculate the final salary
        double newSalary = employee.getSalary() + increaseAmount;

        return newSalary;
    }
}
