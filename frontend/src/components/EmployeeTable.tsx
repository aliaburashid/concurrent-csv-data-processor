import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowRight,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Employee } from '../lib/types';
import { useWorkspace } from '../context/Workspace';
import { ComparisonDialog } from './ComparisonDialog';
import { EmptyState, percent } from './UI';
import { downloadResults } from '../lib/csv';

type SortKey = 'id' | 'salary' | 'updatedSalary' | 'increase';
export function EmployeeTable({
  employees,
  compact = false,
  onViewAll,
}: {
  employees: Employee[];
  compact?: boolean;
  onViewAll?: () => void;
}) {
  const { money } = useWorkspace();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [ascending, setAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Employee | null>(null);
  const filtered = useMemo(
    () =>
      employees
        .filter(
          (e) =>
            (!query || `${e.name} ${e.id}`.toLowerCase().includes(query.toLowerCase())) &&
            (role === 'all' || e.role === role) &&
            (status === 'all' ||
              (status === 'raised' && e.increase > 0) ||
              (status === 'unchanged' && e.increase === 0) ||
              (status === 'decreased' && e.increase < 0) ||
              (status === 'eligible' && e.eligible) ||
              (status === 'ineligible' && !e.eligible)),
        )
        .sort((a, b) => (a[sortKey] - b[sortKey]) * (ascending ? 1 : -1)),
    [employees, query, role, status, sortKey, ascending],
  );
  const pageSize = compact ? 5 : 10;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const sort = (key: SortKey) => {
    setAscending(key === sortKey ? !ascending : true);
    setSortKey(key);
    setPage(1);
  };
  const sortIcon = (key: SortKey) =>
    sortKey === key ? (
      ascending ? (
        <ArrowUp size={12} />
      ) : (
        <ArrowDown size={12} />
      )
    ) : (
      <ArrowDownUp size={12} />
    );

  return (
    <section className="card employee-table-card">
      <div className="table-title">
        <div>
          <h2>
            {compact ? 'Your people, at a glance' : 'Employee directory'}{' '}
            <span className="count-chip">{employees.length}</span>
          </h2>
          <p>
            {compact
              ? 'A clear view of every compensation adjustment.'
              : 'Search, refine, and compare your processed salary records.'}
          </p>
        </div>
        {compact ? (
          <button className="text-button" onClick={onViewAll}>
            View all employees <ArrowRight size={15} />
          </button>
        ) : (
          <button
            className="button secondary small"
            disabled={!filtered.length}
            onClick={() => downloadResults(filtered)}
          >
            Export filtered results
          </button>
        )}
      </div>
      <div className="table-filters">
        <label className="search-field">
          <Search size={16} />
          <input
            aria-label="Search employees by name or ID"
            placeholder="Search by name or employee ID…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear employee search"
              onClick={() => {
                setQuery('');
                setPage(1);
              }}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <div className="filter-selects">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <select
            aria-label="Filter by role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All roles</option>
            {['Director', 'Manager', 'Employee'].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            aria-label="Filter by raise or eligibility status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="raised">Received a raise</option>
            <option value="unchanged">Unchanged</option>
            <option value="decreased">Decreased</option>
            <option value="eligible">Eligible</option>
            <option value="ineligible">Ineligible</option>
          </select>
        </div>
      </div>
      {visible.length ? (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Employee original and updated salaries. Select an employee name for a detailed
              comparison.
            </caption>
            <thead>
              <tr>
                <th
                  aria-sort={sortKey === 'id' ? (ascending ? 'ascending' : 'descending') : 'none'}
                >
                  <button onClick={() => sort('id')}>Employee {sortIcon('id')}</button>
                </th>
                <th>Role</th>
                {(
                  [
                    { key: 'salary', title: 'Original salary' },
                    { key: 'updatedSalary', title: 'Updated salary' },
                    { key: 'increase', title: 'Increase' },
                  ] as const
                ).map((col) => (
                  <th
                    className="number-cell"
                    key={col.key}
                    aria-sort={
                      sortKey === col.key ? (ascending ? 'ascending' : 'descending') : 'none'
                    }
                  >
                    <button onClick={() => sort(col.key)}>
                      {col.title} {sortIcon(col.key)}
                    </button>
                  </th>
                ))}
                <th className="number-cell">Increase %</th>
                <th>
                  <span className="sr-only">Compare</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td>
                    <button className="employee-button" onClick={() => setSelected(e)}>
                      <span className={`avatar avatar-${e.role.toLowerCase()}`}>
                        {e.name
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </span>
                      <span>
                        <strong>{e.name}</strong>
                        <small>EMP-{String(e.id).padStart(3, '0')}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <span className={`role-badge role-${e.role.toLowerCase()}`}>{e.role}</span>
                  </td>
                  <td className="number-cell muted-text">{money(e.salary)}</td>
                  <td className="number-cell salary-cell">{money(e.updatedSalary)}</td>
                  <td
                    className={`number-cell ${e.increase > 0 ? 'teal-text' : e.increase < 0 ? 'warning-text' : 'muted-text'}`}
                  >
                    {e.increase > 0 ? '+' : ''}
                    {money(e.increase)}
                  </td>
                  <td className="number-cell">
                    <span
                      className={`badge ${e.increase === 0 ? 'badge-muted' : e.increase < 0 ? 'badge-warning' : ''}`}
                    >
                      {e.increase > 0 && <ArrowUp size={11} />}
                      {e.increase === 0 ? 'Unchanged' : percent(e.increasePercent)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="icon-button compare-button"
                      aria-label={`Compare ${e.name}'s salaries`}
                      onClick={() => setSelected(e)}
                    >
                      <ArrowUp size={15} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No matching employees"
          message="Try another name, ID, role, or status."
          action={
            <button
              className="button secondary"
              onClick={() => {
                setQuery('');
                setRole('all');
                setStatus('all');
                setPage(1);
              }}
            >
              Reset filters
            </button>
          }
        />
      )}
      <div className="table-footer">
        <span>
          {filtered.length
            ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`
            : '0'}{' '}
          employees {filtered.length !== employees.length && '(filtered)'}
        </span>
        <div className="pagination">
          <button
            aria-label="Previous page"
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span>
            Page {safePage} of {pages}
          </span>
          <button
            aria-label="Next page"
            disabled={safePage === pages}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
      {selected && <ComparisonDialog employee={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
