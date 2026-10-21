import { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  FileSpreadsheet,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  ShieldCheck,
  Upload,
  Users,
  Workflow as WorkflowIcon,
  X,
} from 'lucide-react';
import type { Currency, Page } from './lib/types';
import { useWorkspace } from './context/Workspace';
import { downloadResults } from './lib/csv';
import { ImportDialog } from './components/ImportDialog';
import { EmptyState } from './components/UI';
import { EmployeeTable } from './components/EmployeeTable';
import { Overview } from './pages/Overview';
import { Analysis } from './pages/Analysis';
import { Simulator } from './pages/Simulator';
import { Workflow } from './pages/Workflow';
import { About } from './pages/About';

const nav = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'analysis', label: 'Salary analysis', icon: ChartNoAxesCombined },
  { key: 'simulator', label: 'Salary simulator', icon: Calculator },
  { key: 'workflow', label: 'Processing workflow', icon: WorkflowIcon },
  { key: 'about', label: 'About the project', icon: BookOpen },
] as const;
const copy: Record<Page, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: 'YOUR WORKFORCE, IN PERSPECTIVE',
    title: 'Compensation overview',
    description: 'A thoughtful view of your people, payroll, and progress.',
  },
  employees: {
    eyebrow: 'THE PEOPLE BEHIND THE NUMBERS',
    title: 'Employee compensation',
    description: 'Every record. Every adjustment. A complete picture.',
  },
  analysis: {
    eyebrow: 'UNDERSTAND THE IMPACT',
    title: 'Salary analysis',
    description: 'Explore how compensation changes — and the rules behind it.',
  },
  simulator: {
    eyebrow: 'EXPLORE THE POSSIBILITIES',
    title: 'Salary simulator',
    description: 'A transparent, frontend-only preview of a salary adjustment.',
  },
  workflow: {
    eyebrow: 'BUILT FOR RELIABLE PROCESSING',
    title: 'Processing workflow',
    description: 'See how the Java backend transforms records into reliable results.',
  },
  about: {
    eyebrow: 'ENGINEERING WITH PURPOSE',
    title: 'About the project',
    description: 'A closer look at the architecture behind this workspace.',
  },
};
function currentPage(): Page {
  const hash = window.location.hash.replace('#', '');
  return nav.some((item) => item.key === hash) ? (hash as Page) : 'overview';
}

export default function App() {
  const { dataset, loading, error, currency, setCurrency, restoreSnapshot } = useWorkspace();
  const [page, setPage] = useState<Page>(currentPage);
  const [mobileNav, setMobileNav] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  useEffect(() => {
    const handler = () => {
      setPage(currentPage());
      setMobileNav(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  useEffect(() => {
    document.title = `${copy[page].title} — Ledger`;
  }, [page]);
  useEffect(() => {
    if (!mobileNav) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNav(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [mobileNav]);
  const navigate = (next: Page) => {
    window.location.hash = next;
    setMobileNav(false);
  };
  const dataPage = ['overview', 'employees', 'analysis'].includes(page);

  return (
    <div className={`app-shell ${currency !== 'neutral' ? 'currency-labeled' : ''}`}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to main content
      </a>
      {mobileNav && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`} id="workspace-navigation">
        <a className="brand" href="#overview" aria-label="Ledger overview">
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            ledger<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="workspace-switch">
          <span className="workspace-avatar">
            <LayersIcon />
          </span>
          <div>
            <strong>Compensation</strong>
            <span>CSV Data Processor</span>
          </div>
          <span className="workspace-version">V1</span>
        </div>
        <div className="nav-group-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.slice(0, 5).map((item) => (
            <a
              href={`#${item.key}`}
              key={item.key}
              className={`nav-item ${page === item.key ? 'active' : ''}`}
              aria-current={page === item.key ? 'page' : undefined}
              onClick={() => setMobileNav(false)}
            >
              <item.icon size={18} strokeWidth={1.7} />
              <span>{item.label}</span>
              {page === item.key && <span className="nav-active-dot" />}
            </a>
          ))}
        </nav>
        <div className="nav-divider" />
        <div className="nav-group-label">RESOURCES</div>
        <nav aria-label="Resources">
          <a
            href="#about"
            className={`nav-item ${page === 'about' ? 'active' : ''}`}
            aria-current={page === 'about' ? 'page' : undefined}
            onClick={() => setMobileNav(false)}
          >
            <BookOpen size={18} strokeWidth={1.7} />
            About the project
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-snapshot">
            <span className="sidebar-file-icon">
              <FileSpreadsheet size={20} />
            </span>
            <strong>Your data. Your workspace.</strong>
            <p>Explore your CSV results in a secure, browser-local view.</p>
            <button
              onClick={() => {
                setImportOpen(true);
                setMobileNav(false);
              }}
            >
              Manage data <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="sidebar-footer">
            <ShieldCheck size={14} />
            <span>Local files. Private by design.</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              aria-controls="workspace-navigation"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X size={21} /> : <Menu size={21} />}
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <ChevronRight size={13} />
            <span>{nav.find((item) => item.key === page)?.label}</span>
          </div>
          <div className="topbar-right">
            <span className="local-status">
              <span className="status-dot" />
              Local workspace
            </span>
            <div className="topbar-divider" />
            <button
              className="icon-button help-button"
              aria-label="About this workspace"
              onClick={() => navigate('about')}
            >
              <CircleHelp size={18} />
            </button>
            <span className="profile-avatar" title="Compensation workspace">
              CW
            </span>
          </div>
        </header>
        <main className="main-content" id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">{copy[page].eyebrow}</div>
              <h1>{copy[page].title}</h1>
              <p>{copy[page].description}</p>
            </div>
            <div className="page-actions">
              <button
                className="button secondary"
                disabled={!dataset || loading}
                onClick={() => dataset && downloadResults(dataset.employees)}
              >
                <ArrowDownToLine size={15} />
                Export CSV
              </button>
              <button className="button primary" onClick={() => setImportOpen(true)}>
                <Upload size={15} />
                Import data
              </button>
            </div>
          </div>
          <div className="source-bar">
            <div>
              <span className="source-icon">
                <FileSpreadsheet size={15} />
              </span>
              <strong>
                {dataset
                  ? dataset.source === 'snapshot'
                    ? 'Project CSV snapshot'
                    : 'Imported CSV pair'
                  : 'No dataset loaded'}
              </strong>
              <span className="source-divider">/</span>
              <span className="source-detail">
                {dataset
                  ? `${dataset.employees.length} matched records · ${dataset.source === 'snapshot' ? 'Copied from repository · Not live' : 'Browser memory only'}`
                  : 'Import a CSV pair to get started'}
              </span>
              <button
                className="source-action"
                aria-label="Manage CSV data sources"
                onClick={() => setImportOpen(true)}
              >
                Manage <ArrowRight size={12} />
              </button>
            </div>
            <label className="currency-control">
              Display
              <select
                aria-label="Currency display"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
              >
                <option value="neutral">Numeric units</option>
                <option value="USD">USD</option>
                <option value="BHD">BHD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </label>
          </div>
          {currency !== 'neutral' && (
            <p className="currency-notice">
              {currency} is a display label you selected. No currency conversion is performed; CSV
              values are unchanged.
            </p>
          )}
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
          <div className="page-body" key={page}>
            {loading ? (
              <div className="loading-state" role="status">
                <LoaderCircle className="spin" size={26} />
                <h3>Bringing your data into focus…</h3>
                <p>Reading and validating the project snapshot.</p>
              </div>
            ) : dataPage && !dataset ? (
              <div className="card">
                <EmptyState
                  action={
                    <div className="empty-actions">
                      <button className="button primary" onClick={() => setImportOpen(true)}>
                        Import CSV files
                      </button>
                      <button className="button secondary" onClick={() => void restoreSnapshot()}>
                        Load snapshot
                      </button>
                    </div>
                  }
                />
              </div>
            ) : page === 'overview' ? (
              <Overview navigate={navigate} />
            ) : page === 'employees' ? (
              <EmployeeTable employees={dataset?.employees ?? []} />
            ) : page === 'analysis' ? (
              <Analysis onSimulate={() => navigate('simulator')} />
            ) : page === 'simulator' ? (
              <Simulator />
            ) : page === 'workflow' ? (
              <Workflow />
            ) : (
              <About navigate={navigate} />
            )}
          </div>
          <footer className="main-footer">
            <span>
              LEDGER <i /> Compensation intelligence
            </span>
            <span>Powered by your data. Built for clarity.</span>
          </footer>
        </main>
      </div>
      {importOpen && <ImportDialog onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function LayersIcon() {
  return (
    <span className="workspace-grid">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
