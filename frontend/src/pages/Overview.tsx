import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  ChartNoAxesCombined,
  Layers3,
  Users,
} from 'lucide-react';
import { useWorkspace } from '../context/Workspace';
import type { Page } from '../lib/types';
import { summarize } from '../lib/salary';
import { Card, percent, StatCard } from '../components/UI';
import {
  DistributionChart,
  EligibilityChart,
  PayrollChart,
  RoleIncreaseChart,
} from '../components/Charts';
import { EmployeeTable } from '../components/EmployeeTable';

export function Overview({ navigate }: { navigate: (page: Page) => void }) {
  const { dataset, money } = useWorkspace();
  const employees = dataset?.employees ?? [];
  const s = summarize(employees);
  return (
    <>
      <div className="stats-grid">
        <StatCard
          primary
          title="Total updated payroll"
          value={money(s.updated)}
          detail="Across all employees"
          icon={<Banknote size={19} />}
          tip="The sum of updatedSalary from the processed CSV. No currency is assumed."
        />
        <StatCard
          title="Total payroll increase"
          value={money(s.increase)}
          trend={percent(s.payrollPercent)}
          detail="vs. original"
          icon={<ChartNoAxesCombined size={19} />}
          tip="Updated payroll minus original payroll. The percentage is weighted by original salaries."
        />
        <StatCard
          title="Total employees"
          value={s.count.toLocaleString()}
          detail={`${s.raised} raised · ${s.unchanged} unchanged${s.decreased ? ` · ${s.decreased} decreased` : ''}`}
          icon={<Users size={19} />}
          tip="Employee records matched by ID across both CSV files. Raise counts use the actual saved salary changes."
        />
        <StatCard
          title="Average salary increase"
          value={percent(s.average)}
          detail="Mean increase per employee"
          icon={<ArrowUpRight size={19} />}
          tip="Arithmetic mean of each employee’s percentage change, including unchanged salaries. This differs from the weighted payroll change."
        />
      </div>
      <div className="baseline-strip">
        <span>
          <span className="subtle-dot" />
          Original payroll <strong>{money(s.original)}</strong>
        </span>
        <span>
          <span className="status-dot" />
          {s.raised} employees received raises
        </span>
        <span>
          <span className="subtle-dot" />
          {s.unchanged} salaries unchanged
        </span>
      </div>
      <div className="overview-chart-grid">
        <PayrollChart employees={employees} />
        <EligibilityChart employees={employees} />
      </div>
      <div className="insight-banner">
        <div className="insight-icon">
          <Layers3 size={22} />
        </div>
        <div>
          <strong>Clarity behind every calculation.</strong>
          <p>
            Role, completed years of service, and project performance — one transparent salary
            model.
          </p>
        </div>
        <button className="text-button" onClick={() => navigate('analysis')}>
          Explore the rules <ArrowRight size={16} />
        </button>
      </div>
      <EmployeeTable employees={employees} compact onViewAll={() => navigate('employees')} />
      <div className="two-columns">
        <RoleIncreaseChart employees={employees} />
        <DistributionChart employees={employees} />
      </div>
      <Card className="overview-bottom">
        <div>
          <div className="eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</div>
          <h3>What could the next adjustment look like?</h3>
          <p>Explore a salary scenario using the same rules as the Java service.</p>
        </div>
        <button className="button secondary" onClick={() => navigate('simulator')}>
          Open salary simulator <ArrowUpRight size={16} />
        </button>
      </Card>
    </>
  );
}
