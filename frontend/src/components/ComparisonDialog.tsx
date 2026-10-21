import { ArrowRight, ArrowUpRight, CalendarDays, Target } from 'lucide-react';
import type { Employee } from '../lib/types';
import { useWorkspace } from '../context/Workspace';
import { Modal, percent } from './UI';

export function ComparisonDialog({
  employee: e,
  onClose,
}: {
  employee: Employee;
  onClose: () => void;
}) {
  const { money } = useWorkspace();
  const max = Math.max(e.salary, e.updatedSalary, 1);
  return (
    <Modal
      title={`${e.name}’s salary comparison`}
      description={`Employee #${e.id} · ${e.role} · Values from your loaded CSV pair`}
      onClose={onClose}
    >
      <div className="comparison-values">
        <div>
          <span>Original salary</span>
          <strong>{money(e.salary)}</strong>
        </div>
        <ArrowRight size={22} />
        <div>
          <span>Updated salary</span>
          <strong className="teal-text">{money(e.updatedSalary)}</strong>
        </div>
      </div>
      <div
        className="comparison-chart"
        aria-label={`Original salary ${money(e.salary)}; updated salary ${money(e.updatedSalary)}`}
      >
        <div>
          <span>Before</span>
          <div className="compare-track">
            <div className="compare-bar before" style={{ width: `${(e.salary / max) * 100}%` }} />
          </div>
        </div>
        <div>
          <span>After</span>
          <div className="compare-track">
            <div
              className="compare-bar after"
              style={{ width: `${(e.updatedSalary / max) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="comparison-gain">
        <span className="gain-icon">
          <ArrowUpRight size={22} />
        </span>
        <div>
          <span>Exact salary change</span>
          <strong>
            {e.increase > 0 ? '+' : ''}
            {money(e.increase)}
          </strong>
        </div>
        <span
          className={`badge ${e.increase < 0 ? 'badge-warning' : e.increase === 0 ? 'badge-muted' : ''}`}
        >
          {e.increase > 0 ? '+' : ''}
          {percent(e.increasePercent)}
        </span>
      </div>
      <div className="employee-meta">
        <div>
          <CalendarDays size={16} />
          <span>
            Joined<strong>{e.joinedDate}</strong>
          </span>
        </div>
        <div>
          <Target size={16} />
          <span>
            Project completion<strong>{percent(e.projectCompletion * 100)}</strong>
          </span>
        </div>
      </div>
      <p className="fine-print">
        {e.eligible
          ? 'Eligible under the 60% project completion rule.'
          : 'Below 60% project completion; the backend rule grants no raise.'}{' '}
        This comparison shows saved results; it does not rerun salary calculations.
      </p>
    </Modal>
  );
}
