import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  CheckCheck,
  CircleCheck,
  Code2,
  FileInput,
  FileOutput,
  Hash,
  Layers3,
  ListFilter,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Users,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import { Card, SectionHeading } from '../components/UI';

const steps = [
  {
    title: 'employees.csv',
    label: 'INPUT',
    detail: 'The original employee dataset',
    icon: FileInput,
    description:
      'The input file contains IDs, names, original salaries, joining dates, roles, and project completion fractions. The reader loads it from the application classpath.',
  },
  {
    title: 'CsvReaderService',
    label: 'READ',
    detail: 'Parse the CSV into employee records',
    icon: Code2,
    description:
      'BufferedReader reads UTF-8 input, skips the header, and creates Employee objects. Dates are parsed as LocalDate and completion values are decimal fractions.',
  },
  {
    title: 'Employee Records',
    label: 'PREPARE',
    detail: 'One independent task per employee',
    icon: Users,
    description:
      'A list of Employee objects becomes the work queue. Each employee can be calculated independently, which makes this workload suitable for a thread pool.',
  },
  {
    title: 'ExecutorService',
    label: 'DISPATCH',
    detail: 'Fixed thread pool · 4 worker threads',
    icon: Layers3,
    description:
      'Executors.newFixedThreadPool(4) reuses four worker threads. execute() submits one task per employee. Up to four tasks can run at once; remaining tasks wait in the queue. The executor manages thread lifecycles.',
  },
  {
    title: 'Concurrent Salary Calculations',
    label: 'CALCULATE',
    detail: 'Apply eligibility, tenure, role, and performance rules',
    icon: WorkflowIcon,
    description:
      'Each worker invokes SalaryCalculationService.calculateNewSalary(). The worker tasks may finish in a different order from the input, because scheduling and execution times vary.',
  },
  {
    title: 'ReentrantLock',
    label: 'COLLECT',
    detail: 'Thread-safe results collection',
    icon: LockKeyhole,
    description:
      'All workers append to the same ArrayList. ReentrantLock protects this shared write operation so only one thread modifies the list at a time. The finally block always releases the lock.',
  },
  {
    title: 'AtomicInteger',
    label: 'TRACK',
    detail: 'Success / failure tracking',
    icon: Hash,
    description:
      'Separate processedEmployeeCount and failedEmployeeCount counters are incremented atomically. This prevents lost updates when multiple worker threads report outcomes at the same time.',
  },
  {
    title: 'Wait for All Tasks',
    label: 'SYNCHRONIZE',
    detail: 'shutdown() + awaitTermination()',
    icon: Timer,
    description:
      'shutdown() stops new submissions. awaitTermination() waits up to one minute for the submitted tasks. Timeout, interruption, or any worker failure prevents the service from exporting a partial successful result.',
  },
  {
    title: 'Sort Employee Records by ID',
    label: 'ORDER',
    detail: 'Restore deterministic output ordering',
    icon: ListFilter,
    description:
      'Concurrent completion order is unpredictable. Once all tasks finish successfully, the collected CSV records are sorted numerically by employee ID to make the output stable and easy to compare.',
  },
  {
    title: 'CsvWriterService',
    label: 'WRITE',
    detail: 'Export original and updated salaries',
    icon: Code2,
    description:
      'BufferedWriter writes the id,name,originalSalary,updatedSalary header and the sorted records to the configured project-relative output file.',
  },
  {
    title: 'updated_employees.csv',
    label: 'OUTPUT',
    detail: 'A complete, ordered salary report',
    icon: FileOutput,
    description:
      'The backend output contains each employee’s original and updated salary. Import this file with the matching original CSV to explore the results here. The frontend never writes to this backend file.',
  },
];

export function Workflow() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setActive((index) => {
          if (index >= steps.length - 1) {
            setPlaying(false);
            return index;
          }
          return index + 1;
        }),
      1600,
    );
    return () => clearInterval(timer);
  }, [playing]);
  const step = steps[active];
  return (
    <>
      <div className="workflow-intro">
        <div>
          <span className="badge badge-muted">
            <span className="status-dot" />
            ARCHITECTURE ILLUSTRATION
          </span>
          <h2>Many workers. One reliable result.</h2>
          <p>Follow an employee record from CSV input to a safely collected, ordered output.</p>
        </div>
        <div className="workflow-controls">
          <button
            className="icon-button"
            aria-label="Reset illustration"
            onClick={() => {
              setActive(0);
              setPlaying(false);
            }}
          >
            <RotateCcw size={17} />
          </button>
          <button
            className="button primary"
            onClick={() => {
              if (active === steps.length - 1) setActive(0);
              setPlaying(!playing);
            }}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
            {playing ? 'Pause illustration' : 'Play illustration'}
          </button>
        </div>
      </div>
      <div className="workflow-layout">
        <Card className="workflow-flow">
          <div className="eyebrow">THE PROCESSING PIPELINE</div>
          {steps.map((s, index) => (
            <div key={s.title} className="workflow-stage-wrap">
              <button
                className={`workflow-stage ${index === active ? 'active' : ''} ${index < active ? 'visited' : ''}`}
                onClick={() => {
                  setActive(index);
                  setPlaying(false);
                }}
                aria-pressed={index === active}
              >
                <span className="workflow-stage-icon">
                  <s.icon size={21} />
                </span>
                <span>
                  <small>{s.label}</small>
                  <strong>{s.title}</strong>
                  <span>{s.detail}</span>
                  {index === 3 && (
                    <span className="thread-pool">
                      {[1, 2, 3, 4].map((n) => (
                        <span
                          className={
                            playing && (active === 3 || active === 4) ? 'thread-running' : ''
                          }
                          key={n}
                        >
                          T{n}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span className="workflow-number">
                  {index < active ? <CheckCheck size={17} /> : String(index + 1).padStart(2, '0')}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className={`flow-arrow ${index < active ? 'visited' : ''}`}>
                  <ArrowDown size={17} />
                </div>
              )}
            </div>
          ))}
        </Card>
        <div className="workflow-aside">
          <Card className="workflow-explainer" aria-live="polite">
            <span className="step-label">
              STEP {String(active + 1).padStart(2, '0')} / {steps.length}
            </span>
            <span className="explainer-icon">
              <step.icon size={28} />
            </span>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            <div className="explainer-nav">
              <button
                className="button secondary small"
                disabled={active === 0}
                onClick={() => {
                  setActive(active - 1);
                  setPlaying(false);
                }}
              >
                Previous
              </button>
              <button
                className="button secondary small"
                disabled={active === steps.length - 1}
                onClick={() => {
                  setActive(active + 1);
                  setPlaying(false);
                }}
              >
                Next step <ArrowRight size={14} />
              </button>
            </div>
          </Card>
          <div className="workflow-callout">
            <CircleCheck size={20} />
            <div>
              <strong>Safety before export</strong>
              <p>
                The service checks that all tasks finished and no workers failed before writing the
                output.
              </p>
            </div>
          </div>
          <p className="fine-print">
            This is an educational illustration of the existing Java implementation. It is not a
            live monitor, and playing it does not run the backend.
          </p>
        </div>
      </div>
      <div className="two-columns workflow-principles">
        <Card>
          <SectionHeading
            title="Parallel calculations"
            subtitle="Independent work scales across reusable threads."
          />
          <p>
            The fixed pool bounds concurrency at four workers, avoiding the cost and resource use of
            creating a thread for every employee.
          </p>
        </Card>
        <Card>
          <SectionHeading
            title="Deterministic delivery"
            subtitle="Concurrent execution, predictable output."
          />
          <p>
            The lock protects collection, atomic counters protect tracking, and sorting after
            completion restores a consistent employee ID order.
          </p>
        </Card>
      </div>
    </>
  );
}
