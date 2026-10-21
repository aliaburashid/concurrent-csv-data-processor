import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  CircleHelp,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Card, percent, SectionHeading } from '../components/UI';
import { SalaryComparisonChart } from '../components/Charts';
import { localISODate, simulateSalary } from '../lib/salary';
import { useWorkspace } from '../context/Workspace';
import type { Role } from '../lib/types';

const defaults = {
  salary: '50000',
  role: 'Manager' as Role,
  joinedDate: '2023-01-01',
  completion: '80',
};
export function Simulator() {
  const { money } = useWorkspace();
  const [input, setInput] = useState(defaults);
  const [asOf, setAsOf] = useState(localISODate());
  let result: ReturnType<typeof simulateSalary> | null = null;
  let error = '';
  try {
    if (!input.salary || !input.completion)
      throw new Error('Enter a salary and project completion percentage.');
    result = simulateSalary(
      Number(input.salary),
      input.role,
      input.joinedDate,
      Number(input.completion) / 100,
      asOf,
    );
  } catch (e) {
    error = e instanceof Error ? e.message : 'Check your scenario inputs.';
  }
  const update = <K extends keyof typeof input>(key: K, value: (typeof input)[K]) =>
    setInput((old) => ({ ...old, [key]: value }));

  return (
    <>
      <div className="simulator-notice">
        <ShieldCheck size={21} />
        <div>
          <strong>A space to explore. Your records stay untouched.</strong>
          <p>
            This frontend-only preview mirrors the Java salary rules. It does not execute the
            backend or write to either CSV.
          </p>
        </div>
        <span className="badge">PREVIEW ONLY</span>
      </div>
      <div className="simulator-grid">
        <Card className="scenario-card">
          <SectionHeading
            title="Build a salary scenario"
            subtitle="Adjust the inputs and see the result instantly."
            action={
              <span className="scenario-icon">
                <Calculator size={21} />
              </span>
            }
          />
          <div className="form-grid">
            <label>
              Original salary
              <span className="input-suffix">
                <input
                  type="number"
                  min="0"
                  max="1000000000000"
                  step="any"
                  value={input.salary}
                  onChange={(e) => update('salary', e.target.value)}
                />
                <span>units</span>
              </span>
            </label>
            <label>
              Role
              <select value={input.role} onChange={(e) => update('role', e.target.value as Role)}>
                {['Employee', 'Manager', 'Director'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              Joining date
              <input
                type="date"
                value={input.joinedDate}
                max={asOf}
                onChange={(e) => update('joinedDate', e.target.value)}
              />
            </label>
            <label>
              Calculation date
              <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </label>
          </div>
          <div className="completion-control">
            <label htmlFor="completion-number">
              Project completion
              <span className="input-suffix">
                <input
                  id="completion-number"
                  aria-label="Project completion"
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={input.completion}
                  onChange={(e) => update('completion', e.target.value)}
                />
                <span>%</span>
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              aria-label="Project completion slider"
              value={Number(input.completion) || 0}
              onChange={(e) => update('completion', e.target.value)}
              style={{ accentColor: '#238d80' }}
            />
            <div className="range-markers">
              <span>0%</span>
              <span>60% eligibility</span>
              <span>100%</span>
            </div>
            <div className="threshold-buttons">
              <button className="button secondary small" onClick={() => update('completion', '60')}>
                Try 60%
              </button>
              <button className="button secondary small" onClick={() => update('completion', '80')}>
                Try 80%
              </button>
              <button className="button secondary small" onClick={() => update('completion', '81')}>
                Try 81%
              </button>
            </div>
          </div>
          <div className="scenario-note">
            <CircleHelp size={16} />
            <p>
              Service is based on fully completed calendar years at the calculation date. The Java
              backend uses its system’s current date.
            </p>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setInput(defaults);
              setAsOf(localISODate());
            }}
          >
            <RotateCcw size={14} />
            Reset scenario
          </button>
        </Card>
        <Card className="simulation-result">
          <SectionHeading eyebrow="YOUR SCENARIO" title="The compensation outlook" />
          {result ? (
            <div aria-live="polite">
              <div className="simulation-total">
                <span>Calculated updated salary</span>
                <strong data-testid="simulated-salary">{money(result.updatedSalary)}</strong>
                <div>
                  <span className={`badge ${result.eligible ? '' : 'badge-muted'}`}>
                    {result.eligible ? <Check size={13} /> : <CircleHelp size={13} />}
                    {result.eligible ? 'Eligible for a raise' : 'Not eligible'}
                  </span>
                  <span className="teal-text">
                    <ArrowUpRight size={14} />
                    {percent(result.finalRate * 100)}
                  </span>
                </div>
              </div>
              <SalaryComparisonChart
                original={Number(input.salary)}
                updated={result.updatedSalary}
              />
              <dl className="calculation-breakdown">
                <div>
                  <dt>Completed years of service</dt>
                  <dd>{result.years} years</dd>
                </div>
                <div>
                  <dt>Role-based increase</dt>
                  <dd>{percent(result.roleRate * 100)}</dd>
                </div>
                <div>
                  <dt>Years-of-service increase</dt>
                  <dd>
                    {result.years} × 2% = {percent(result.serviceRate * 100)}
                  </dd>
                </div>
                <div>
                  <dt>Performance multiplier</dt>
                  <dd>{result.multiplier.toFixed(1)}×</dd>
                </div>
                <div className="breakdown-total">
                  <dt>Applied increase</dt>
                  <dd>
                    {percent(result.finalRate * 100)} <ArrowRight size={13} /> +
                    {money(result.increase)}
                  </dd>
                </div>
              </dl>
              {!result.eligible && (
                <p className="fine-print">
                  Role and service rates are shown for context. Below 60% completion, the backend
                  returns the original salary before applying these rates.
                </p>
              )}
            </div>
          ) : (
            <div className="error-message" role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </Card>
      </div>
      <p className="fine-print">
        Illustrative scenario inputs are separate from the employee dataset. Calculations use
        unrounded numbers, matching the Java service; displayed amounts are formatted for
        readability.
      </p>
    </>
  );
}
