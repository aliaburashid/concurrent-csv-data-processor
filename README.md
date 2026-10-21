# Concurrent CSV Data Processor

A Java and Spring Boot application that processes employee salary adjustments **concurrently**. It reads employee records from a CSV file, applies salary-increase rules based on role, completed years of service, and project completion, then exports the original and updated salaries to a new CSV file.

The project demonstrates Java multithreading, thread pooling, thread-safe shared state, file handling, exception handling, and automated testing.

## How to View the Frontend

The React dashboard lets you explore employee salaries, compare before-and-after results, and try the salary simulator.

With **Node.js 22.12+ (or 20.19+)** and **npm** installed, run these commands from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser. If that port is already in use, open the Local URL printed in the terminal instead. Keep the terminal running while using the dashboard; press `Ctrl+C` to stop it.

The frontend runs independently of Spring Boot and loads a bundled snapshot of the project's CSV data. To view results from a new backend run, choose **Import data** or **Manage** and select the matching `employees.csv` and `updated_employees.csv` files from `src/main/resources/`.

See the [frontend README](frontend/README.md) for more setup, build, and usage details.

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Java 17 | Core language and salary-calculation logic |
| Spring Boot | Application setup, service management, and startup execution |
| Maven | Dependency management and build tooling |
| Java Executor Framework (`ExecutorService`) | Concurrent processing with a fixed thread pool |
| `ReentrantLock` | Thread-safe writes to the shared result list |
| `AtomicInteger` | Thread-safe success and failure counters |
| Java I/O (`BufferedReader`, `BufferedWriter`) | CSV input and output |
| Java Time API (`LocalDate`, `Period`) | Completed-years-of-service calculation |
| Lombok | Reduces model boilerplate |
| JUnit 5 | Unit testing |
| Git and GitHub | Version control |

## What the Application Does

The application reads a sample dataset of **30 employees**. Each record includes an employee ID, name, current salary, joining date, role, and project-completion rate. It calculates the revised salary for each employee, processes multiple employees in parallel, and writes the results to `updated_employees.csv`.

### Salary Increase Rules

1. **Eligibility:** Employees with project completion **below 60%** receive no raise.
2. **Years of service:** Eligible employees receive **2% per fully completed year** since their joining date.
3. **Role increase:** Director **5%**, Manager **2%**, Employee **1%**.
4. **Performance bonus:** If project completion is **strictly greater than 80%**, multiply the combined increase percentage by **1.5**. Exactly 80% does not receive the multiplier.

For eligible employees:

```text
baseIncreaseRate = yearsOfServiceRate + roleIncreaseRate
finalIncreaseRate = baseIncreaseRate × (1.5 if completion > 0.80, otherwise 1.0)
increaseAmount = originalSalary × finalIncreaseRate
updatedSalary = originalSalary + increaseAmount
```

**Example:** A Manager earning 50,000, with 3 completed years of service and 90% project completion:

```text
Years of service: 3 × 2% = 6%
Role increase: 2%
Combined increase: 8%
Performance multiplier: 8% × 1.5 = 12%
Updated salary: 50,000 + (50,000 × 0.12) = 56,000
```

## Processing Workflow

```text
Start Spring Boot application
           |
           v
CommandLineRunner starts processing
           |
           v
CsvReaderService loads employees.csv
           |
           v
Create a fixed pool of 4 worker threads
           |
           v
Submit one employee task per record with execute()
           |
           v
SalaryCalculationService calculates updated salaries
           |
           v
ReentrantLock protects writes to the shared results list
AtomicInteger counts successes and failures
           |
           v
Shut down pool and await task completion
           |
           v
Check for processing failures
           |
           v
Sort output records by employee ID
           |
           v
CsvWriterService exports updated_employees.csv
```

The worker threads may finish in a different order from the input records. The results are sorted **after** the workers finish so the exported CSV follows employee ID order.

## Concurrency Design

- **`Executors.newFixedThreadPool(4)`** creates four worker threads, allowing up to four employee tasks to run at once.
- **`execute()`** submits an individual employee-processing task to the pool.
- **`ReentrantLock`** protects the shared `ArrayList` while a worker adds its CSV output record. The lock is released in a `finally` block.
- **`AtomicInteger`** safely tracks processed and failed employee counts across threads.
- **`shutdown()` and `awaitTermination()`** ensure processing finishes before the output is checked and written.
- **Error handling:** Worker exceptions are counted and reported. If any employee fails, the service reports a processing error rather than writing a partial successful export.

A `Semaphore` was not added because the fixed thread pool already bounds concurrent employee tasks, and no separate resource limit is needed for the current implementation.

## Project Structure

```text
csvprocessor/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/com/example/csvprocessor/
│   │   │   ├── CsvprocessorApplication.java
│   │   │   ├── model/
│   │   │   │   └── Employee.java
│   │   │   ├── service/
│   │   │   │   ├── CsvReaderService.java
│   │   │   │   ├── SalaryCalculationService.java
│   │   │   │   ├── EmployeeProcessingService.java
│   │   │   │   └── CsvWriterService.java
│   │   │   └── exception/
│   │   │       ├── InvalidEmployeeRoleException.java
│   │   │       ├── InvalidJoiningDateException.java
│   │   │       └── SalaryProcessingException.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── employees.csv
│   │       └── updated_employees.csv
│   └── test/java/com/example/csvprocessor/
│       └── service/
│           └── SalaryCalculationServiceTest.java
└── README.md
```

### Main Classes

| Class | Responsibility |
| --- | --- |
| `Employee` | Stores the employee's data |
| `CsvReaderService` | Reads and parses input CSV records |
| `SalaryCalculationService` | Validates applicable data and calculates salary increases |
| `EmployeeProcessingService` | Coordinates the thread pool, result collection, counters, error checks, sorting, and export |
| `CsvWriterService` | Writes original and updated salary values to CSV |
| `CsvprocessorApplication` | Starts Spring Boot and invokes the processing workflow through `CommandLineRunner` |
| Custom exceptions | Report invalid roles, invalid joining dates, and processing failures |

## How to Run

### Prerequisites

- **JDK 17**
- **Maven** (or the Maven wrapper, if included in your checkout)
- **IntelliJ IDEA** or another Java IDE (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/aliaburashid/concurrent-csv-data-processor.git
cd concurrent-csv-data-processor
```

### 2. Check the Input Data

The input CSV is located at:

```text
src/main/resources/employees.csv
```

Input columns:

```csv
id,name,salary,joinedDate,role,projectCompletion
1,Alice,52000,2019-05-12,Employee,0.8
```

`projectCompletion` uses decimal values: `0.6` means 60%, and `0.9` means 90%.

### 3. Configure the Application

In `src/main/resources/application.properties`, the application is configured to use:

```properties
server.port=9091
```

If port 9091 is already occupied, choose another available port. **No HTTP request is needed to start salary processing**: `CommandLineRunner` runs it automatically after Spring Boot starts.

### 4. Run the Application

**Option A — IntelliJ IDEA:** Open the project, allow Maven dependencies to load, then run `CsvprocessorApplication.java`.

**Option B — Terminal:**

```bash
mvn spring-boot:run
```

If your checkout includes `mvnw`, you can use `./mvnw spring-boot:run` instead.

### 5. Check the Results

On a successful run, the console reports:

```text
Successfully processed employees: 30
Failed employees: 0
Updated employee salaries exported successfully!
```

The output is written to:

```text
src/main/resources/updated_employees.csv
```

Output columns:

```csv
id,name,originalSalary,updatedSalary
1,Alice,52000.0,59800.0
2,Bob,68000.0,77520.0
3,Charlie,75000.0,86250.0
```

**Important:** The current writer uses a project-relative path under `src/main/resources`. Run from the project root when using this setup. This is convenient for local development; for a packaged JAR or deployed application, configure a writable external output directory instead. The output file is overwritten on each successful run.

## Testing

JUnit 5 tests cover salary-related behavior such as:

- Invalid or missing employee roles
- Role-based percentage increases
- Years-of-service calculations
- Combined salary calculations and performance multiplier
- Employees below the 60% eligibility threshold

Run the tests with:

```bash
mvn test
```

The tests help validate the calculation rules independently of the concurrent processing workflow.

## Implementation Report and Outcomes

**Approach:** The project separates reading, salary calculation, concurrency coordination, and writing into individual Spring services. This keeps the business rules independent of the CSV and thread-management code.

**Concurrency:** A four-thread `ExecutorService` processes employees in parallel. A `ReentrantLock` protects the shared output list, and atomic counters record task outcomes without lost updates. Once all tasks finish, results are sorted by employee ID before export.

**Validation and reliability:** Invalid roles and joining dates are handled through custom exceptions. The processing service records failed tasks and prevents an incomplete batch from being exported as a successful result.

**Observed local run:**

| Measure | Result |
| --- | --- |
| Input records | 30 employees |
| Successfully processed | 30 |
| Failed | 0 |
| Output | CSV with original and updated salaries |
| Output order | Employee ID, ascending |
| Git commits | 31 (at the time of review) |

**Limitations / future improvements:** CSV parsing currently uses simple comma-separated values and is intended for the supplied sample data; a production CSV parser would better support quoted commas and more complex inputs. The output location is currently suited to local development. Optional extensions include a frontend for comparing before-and-after salaries, configurable salary-increase percentages, and configurable input/output paths.

## Version Control

The project is maintained using Git and GitHub, with incremental commits documenting development. At the time of the project review, the repository contained **31 commits**, exceeding the assignment's minimum requirement of 20.

## Author

Alia Burashed
