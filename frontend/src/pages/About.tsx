import {
  ArrowRight,
  Braces,
  CheckCheck,
  FileSpreadsheet,
  GitBranch,
  Layers3,
  LockKeyhole,
  Terminal,
} from 'lucide-react';
import { Card, SectionHeading } from '../components/UI';
import type { Page } from '../lib/types';

export function About({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <Card className="about-hero">
        <span className="about-mark">
          <Layers3 size={34} strokeWidth={1.5} />
        </span>
        <div className="eyebrow">THE PROJECT BEHIND THE NUMBERS</div>
        <h2>Concurrency meets clarity.</h2>
        <p>
          A dedicated analytics workspace for the Concurrent CSV Data Processor. Turning employee
          salary results into a clear, interactive view of compensation.
        </p>
        <div className="technology-tags">
          <span>Java 17</span>
          <span>Spring Boot</span>
          <span>React + TypeScript</span>
        </div>
      </Card>
      <div className="about-grid">
        {[
          {
            icon: Terminal,
            title: 'A focused Java backend',
            text: 'Spring Boot wires independent CSV reading, salary calculation, concurrent coordination, and writing services. A CommandLineRunner starts processing; the frontend does not require or invent a REST API.',
          },
          {
            icon: GitBranch,
            title: 'Concurrency with intention',
            text: 'A fixed four-thread ExecutorService processes independent employees in parallel. ReentrantLock protects the shared result list, and AtomicInteger records successes and failures without lost updates.',
          },
          {
            icon: FileSpreadsheet,
            title: 'From records to decisions',
            text: 'Salary rules combine eligibility, completed service, role, and performance. Successful output is sorted by employee ID and exported to CSV, ready for comparison and payroll analysis.',
          },
          {
            icon: CheckCheck,
            title: 'Rules backed by tests',
            text: 'The existing JUnit 5 suite covers salary rules, role validation, completed years of service, and eligibility. Frontend tests separately verify CSV matching, financial summaries, and simulator boundaries.',
          },
        ].map((item) => (
          <Card className="about-feature" key={item.title}>
            <span className="feature-icon">
              <item.icon size={22} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Card>
        ))}
      </div>
      <Card className="about-architecture">
        <SectionHeading
          title="Two independent layers. One clear purpose."
          subtitle="The backend owns processing. The frontend makes the exported results easy to explore."
        />
        <div className="architecture-layers">
          <div>
            <span className="eyebrow">PROCESSING LAYER</span>
            <h3>
              <Terminal size={20} />
              Java & Spring Boot
            </h3>
            <p>CSV input → concurrent salary calculations → ordered CSV output</p>
            <span>ExecutorService · ReentrantLock · AtomicInteger · JUnit 5</span>
          </div>
          <ArrowRight className="architecture-arrow" size={25} />
          <div>
            <span className="eyebrow">PRESENTATION LAYER</span>
            <h3>
              <Braces size={20} />
              React & TypeScript
            </h3>
            <p>Local CSV import → interactive analysis → downloadable results</p>
            <span>Vite · Tailwind CSS · Lucide React · Recharts · Papa Parse</span>
          </div>
        </div>
        <div className="privacy-note">
          <LockKeyhole size={19} />
          <span>
            All imported data stays in browser memory. Refreshing restores the bundled snapshot. The
            existing backend and its CSV files remain read-only to this frontend.
          </span>
        </div>
      </Card>
      <div className="about-links">
        <button className="button secondary" onClick={() => navigate('workflow')}>
          Explore the processing workflow <ArrowRight size={16} />
        </button>
        <button className="text-button" onClick={() => navigate('analysis')}>
          Understand the salary rules <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}
