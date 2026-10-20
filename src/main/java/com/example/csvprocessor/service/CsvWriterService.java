package com.example.csvprocessor.service;

import org.springframework.stereotype.Service;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

@Service
public class CsvWriterService {

    public void writeUpdatedSalaries(List<String> updatedEmployeeRecords) throws IOException {

        // Create an output CSV file and automatically close it when finished
        try (BufferedWriter writer = new BufferedWriter(
                new FileWriter("src/main/resources/updated_employees.csv"))) {

            // Write column names before the employee records.
            writer.write("id,name,originalSalary,updatedSalary");
            writer.newLine();

            // Write each employee updated salary on a separate line
            for (String employeeRecord : updatedEmployeeRecords) {
                writer.write(employeeRecord);
                writer.newLine();
            }
        }
    }
}