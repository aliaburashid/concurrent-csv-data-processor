import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, CircleHelp } from 'lucide-react';
import type { Employee } from '../lib/types';
import { roleSummary, summarize } from '../lib/salary';
import { useWorkspace } from '../context/Workspace';
import { Card, percent, SectionHeading } from './UI';

const TEAL = '#238d80';
const NAVY = '#243f52';
const SLATE = '#b6c5cf';
const tooltipStyle = {
  border: '1px solid #e4eaed',
  borderRadius: 10,
  fontSize: 12,
  boxShadow: '0 6px 24px #142c3d0d',
  padding: '10px 14px',
};
const axis = { fill: '#667b89', fontSize: 12 };

export function PayrollChart({ employees }: { employees: Employee[] }) {
  const { money } = useWorkspace();
  const [group, setGroup] = useState('role');
  const totals = summarize(employees);
  const data = useMemo(
    () =>
      group === 'role'
        ? roleSummary(employees).map((r) => ({
            name: r.role,
            Original: r.original,
            Updated: r.updated,
          }))
        : [{ name: 'All employees', Original: totals.original, Updated: totals.updated }],
    [employees, group, totals.original, totals.updated],
  );
  return (
    <Card className="chart-card payroll-card">
      <SectionHeading
        title="Payroll comparison"
        subtitle="The impact of every adjustment, together."
        action={
          <select
            className="small-select"
            aria-label="Payroll chart grouping"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            <option value="role">By role</option>
            <option value="total">Total payroll</option>
          </select>
        }
      />
      <div className="chart-legend">
        <span>
          <i style={{ background: SLATE }} />
          Original payroll
        </span>
        <span>
          <i style={{ background: TEAL }} />
          Updated payroll
        </span>
      </div>
      <div
        className="chart-container"
        role="img"
        aria-label="Grouped bar chart comparing original and updated payroll by role"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 14, right: 6, left: -12, bottom: 0 }}
            barGap={7}
            barCategoryGap="28%"
          >
            <CartesianGrid vertical={false} stroke="#edf0f2" strokeDasharray="3 4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axis} dy={9} />
            <YAxis
              tickFormatter={(v) => money(Number(v), true)}
              axisLine={false}
              tickLine={false}
              tick={axis}
              width={76}
            />
            <Tooltip
              cursor={{ fill: '#f5f8fa' }}
              contentStyle={tooltipStyle}
              formatter={(v) => money(Number(v))}
            />
            <Bar
              dataKey="Original"
              fill={SLATE}
              radius={[4, 4, 0, 0]}
              maxBarSize={46}
              isAnimationActive={false}
            />
            <Bar
              dataKey="Updated"
              fill={TEAL}
              radius={[4, 4, 0, 0]}
              maxBarSize={46}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-foot">
        <span>
          <ArrowUpRight size={15} />
          {percent(totals.payrollPercent)} overall payroll change
        </span>
        <span>All values from CSV</span>
      </div>
    </Card>
  );
}

export function EligibilityChart({ employees }: { employees: Employee[] }) {
  const s = summarize(employees);
  const data = [
    { name: 'Eligible', value: s.eligible },
    { name: 'Ineligible', value: s.ineligible },
  ];
  return (
    <Card className="chart-card eligibility-card">
      <SectionHeading
        title="Raise eligibility"
        subtitle="Based on project completion."
        action={
          <span title="Eligible means project completion is at least 60%.">
            <CircleHelp size={16} />
          </span>
        }
      />
      <div className="donut-wrap">
        <div
          className="donut-chart"
          role="img"
          aria-label={`${s.eligible} eligible employees and ${s.ineligible} ineligible employees`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius="72%"
                outerRadius="94%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={s.eligible && s.ineligible ? 4 : 0}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell key={d.name} fill={i ? '#e7edef' : TEAL} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v) => [`${v} employees`, undefined]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="donut-center">
          <strong>{percent(s.count ? (s.eligible / s.count) * 100 : 0)}</strong>
          <span>eligible for a raise</span>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={d.name}>
            <span>
              <i style={{ background: i ? '#e7edef' : TEAL }} />
              {d.name}
            </span>
            <strong>
              {d.value}
              <small>{percent(s.count ? (d.value / s.count) * 100 : 0)}</small>
            </strong>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RoleIncreaseChart({ employees }: { employees: Employee[] }) {
  const { money } = useWorkspace();
  const data = roleSummary(employees).map((r) => ({ role: r.role, increase: r.increase }));
  return (
    <Card className="chart-card">
      <SectionHeading
        title="Salary increases by role"
        subtitle="Total adjustment across each role."
      />
      <div
        className="chart-container compact-chart"
        role="img"
        aria-label="Total salary increase for directors, managers, and employees"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 25, top: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="#edf0f2" strokeDasharray="3 4" />
            <XAxis
              type="number"
              tickFormatter={(v) => money(Number(v), true)}
              axisLine={false}
              tickLine={false}
              tick={axis}
            />
            <YAxis
              type="category"
              dataKey="role"
              axisLine={false}
              tickLine={false}
              tick={axis}
              width={76}
            />
            <Tooltip
              cursor={{ fill: '#f5f8fa' }}
              contentStyle={tooltipStyle}
              formatter={(v) => [money(Number(v)), 'Total increase']}
            />
            <Bar dataKey="increase" radius={[0, 4, 4, 0]} barSize={25} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell key={d.role} fill={[NAVY, TEAL, '#88bdb5'][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function DistributionChart({ employees }: { employees: Employee[] }) {
  const bins = [
    { name: 'Unchanged', value: employees.filter((e) => e.increase === 0).length },
    {
      name: '0–10%',
      value: employees.filter((e) => e.increasePercent > 0 && e.increasePercent <= 10).length,
    },
    {
      name: '10–20%',
      value: employees.filter((e) => e.increasePercent > 10 && e.increasePercent <= 20).length,
    },
    { name: 'Above 20%', value: employees.filter((e) => e.increasePercent > 20).length },
    ...(employees.some((e) => e.increase < 0)
      ? [{ name: 'Decreased', value: employees.filter((e) => e.increase < 0).length }]
      : []),
  ];
  return (
    <Card className="chart-card">
      <SectionHeading
        title="Distribution of increases"
        subtitle="How salary adjustments are spread across your people."
      />
      <div
        className="chart-container compact-chart"
        role="img"
        aria-label="Employee counts grouped by salary increase percentage"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ left: -30, right: 0, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#edf0f2" strokeDasharray="3 4" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axis} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={axis} />
            <Tooltip
              cursor={{ fill: '#f5f8fa' }}
              contentStyle={tooltipStyle}
              formatter={(v) => [`${v} employees`, 'Count']}
            />
            <Bar
              dataKey="value"
              fill={TEAL}
              radius={[4, 4, 0, 0]}
              maxBarSize={52}
              isAnimationActive={false}
            >
              {bins.map((d, i) => (
                <Cell key={d.name} fill={i === 0 ? SLATE : TEAL} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function SalaryComparisonChart({
  original,
  updated,
}: {
  original: number;
  updated: number;
}) {
  const { money } = useWorkspace();
  return (
    <div className="chart-container compact-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[{ name: 'Salary', Original: original, Updated: updated }]}
          margin={{ left: -10, top: 10 }}
        >
          <CartesianGrid vertical={false} stroke="#edf0f2" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axis} />
          <YAxis
            tickFormatter={(v) => money(Number(v), true)}
            axisLine={false}
            tickLine={false}
            tick={axis}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar
            dataKey="Original"
            isAnimationActive={false}
            fill={SLATE}
            radius={[5, 5, 0, 0]}
            maxBarSize={64}
          />
          <Bar
            dataKey="Updated"
            isAnimationActive={false}
            fill={TEAL}
            radius={[5, 5, 0, 0]}
            maxBarSize={64}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
