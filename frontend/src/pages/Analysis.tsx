import { ArrowRight, BriefcaseBusiness, CalendarDays, CircleCheck, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/Workspace';
import { DistributionChart, RoleIncreaseChart } from '../components/Charts';
import { Card, percent, SectionHeading } from '../components/UI';
import { roleSummary } from '../lib/salary';

export function Analysis({ onSimulate }: { onSimulate: () => void }) {
  const { dataset, money } = useWorkspace();
  const employees = dataset?.employees ?? [];
  return (
    <>
      <div className="two-columns">
        <RoleIncreaseChart employees={employees} />
        <DistributionChart employees={employees} />
      </div>
      <Card className="role-summary">
        <SectionHeading
          title="The role-level view"
          subtitle="Aggregated from the actual original and updated salary records."
        />
        <div className="role-summary-grid">
          {roleSummary(employees).map((r) => (
            <div key={r.role}>
              <span className={`role-badge role-${r.role.toLowerCase()}`}>{r.role}</span>
              <strong>{money(r.increase)}</strong>
              <span>Total payroll increase</span>
              <dl>
                <div>
                  <dt>People</dt>
                  <dd>{r.count}</dd>
                </div>
                <div>
                  <dt>Received a raise</dt>
                  <dd>{r.raised}</dd>
                </div>
                <div>
                  <dt>Average increase</dt>
                  <dd>{percent(r.average)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Card>
      <div className="rules-section">
        <SectionHeading
          eyebrow="THE LOGIC, MADE CLEAR"
          title="A transparent approach to compensation"
          subtitle="The rules implemented in SalaryCalculationService — explained step by step."
          action={
            <button className="button secondary small" onClick={onSimulate}>
              Try a scenario <ArrowRight size={15} />
            </button>
          }
        />
        <div className="rules-grid">
          {[
            {
              icon: CircleCheck,
              number: '01',
              title: 'Start with eligibility',
              value: '60%',
              unit: 'minimum completion',
              text: 'Below 60% project completion, the original salary is returned immediately. At exactly 60%, the employee is eligible.',
            },
            {
              icon: CalendarDays,
              number: '02',
              title: 'Recognize service',
              value: '2%',
              unit: 'per completed year',
              text: 'Only fully completed years count. The Java service uses Period.between(joinedDate, today).getYears().',
            },
            {
              icon: BriefcaseBusiness,
              number: '03',
              title: 'Account for role',
              value: '1–5%',
              unit: 'role-based increase',
              text: 'Director: 5% · Manager: 2% · Employee: 1%. Add this rate to the completed-years-of-service rate.',
            },
            {
              icon: Sparkles,
              number: '04',
              title: 'Reward performance',
              value: '1.5×',
              unit: 'above 80% completion',
              text: 'Multiply the combined rate by 1.5 only when completion is strictly above 80%. Exactly 80% uses 1.0×.',
            },
          ].map((rule) => (
            <Card className="rule-card" key={rule.number}>
              <div className="rule-top">
                <span className="rule-icon">
                  <rule.icon size={22} />
                </span>
                <span>{rule.number}</span>
              </div>
              <h3>{rule.title}</h3>
              <div className="rule-value">{rule.value}</div>
              <span className="rule-unit">{rule.unit}</span>
              <p>{rule.text}</p>
            </Card>
          ))}
        </div>
        <div className="formula-card">
          <div>
            <span className="eyebrow">FOR ELIGIBLE EMPLOYEES</span>
            <h3>The salary formula</h3>
          </div>
          <div className="formula">
            <span>Original salary</span>
            <b>×</b>
            <span>
              (1 + <em>(Role rate + Service rate) × Multiplier</em>)
            </span>
            <b>=</b>
            <strong>Updated salary</strong>
          </div>
        </div>
        <p className="fine-print">
          Saved CSV values remain the source of truth for the dashboard. The output CSV does not
          record a processing date; service tenure in a new simulation may differ from the saved
          run.
        </p>
      </div>
    </>
  );
}
