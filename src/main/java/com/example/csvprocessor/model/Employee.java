package com.example.csvprocessor.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Employee {

    private int id;
    private String name;
    private double salary;
    // how many complete years each employee has worked to determine their salary increase
    private LocalDate joinedDate;
    private String role;
    private double projectCompletion;
}
