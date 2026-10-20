package com.example.csvprocessor;

import com.example.csvprocessor.service.EmployeeProcessingService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class CsvprocessorApplication {

	@Bean
	public CommandLineRunner runSalaryProcessor(EmployeeProcessingService employeeProcessingService) {

		return args -> {
			// Start concurrent salary processing after Spring Boot initializes
			employeeProcessingService.calculateEmployeeSalariesConcurrently();
		};
	}

	public static void main(String[] args) {
		SpringApplication.run(CsvprocessorApplication.class, args);
	}

}
