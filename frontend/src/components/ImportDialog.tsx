import { useState } from 'react';
import {
  AlertCircle,
  Check,
  FileSpreadsheet,
  FolderOpen,
  LoaderCircle,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useWorkspace } from '../context/Workspace';
import { MAX_FILE_BYTES, parseEmployeePair } from '../lib/csv';
import { Modal } from './UI';

export function ImportDialog({ onClose }: { onClose: () => void }) {
  const { dataset, setDataset, restoreSnapshot } = useWorkspace();
  const [original, setOriginal] = useState<File | null>(null);
  const [updated, setUpdated] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function importFiles() {
    if (!original || !updated || busy) return;
    setBusy(true);
    setError('');
    try {
      if (original.size > MAX_FILE_BYTES || updated.size > MAX_FILE_BYTES)
        throw new Error('Each CSV file must be 10 MB or smaller.');
      const [a, b] = await Promise.all([original.text(), updated.text()]);
      const employees = parseEmployeePair(a, b);
      setDataset({
        employees,
        originalFile: original.name,
        updatedFile: updated.name,
        source: 'import',
        loadedAt: new Date().toISOString(),
      });
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Unable to read these files. Please select a valid CSV pair.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Bring your data into focus"
      description="Select the original employee file and its matching processed output."
      onClose={onClose}
    >
      <div className="privacy-note">
        <ShieldCheck size={20} />
        <span>
          <strong>Your files stay with you.</strong> Parsing happens in this browser. No uploads,
          CSV edits, or backend execution.
        </span>
      </div>
      <div className="file-inputs">
        {[
          {
            key: 'original',
            label: 'Original employees',
            hint: 'employees.csv',
            file: original,
            set: setOriginal,
          },
          {
            key: 'updated',
            label: 'Processed salaries',
            hint: 'updated_employees.csv',
            file: updated,
            set: setUpdated,
          },
        ].map((item) => (
          <label className={`file-drop ${item.file ? 'file-selected' : ''}`} key={item.key}>
            <span className="file-icon">
              {item.file ? <Check size={22} /> : <FileSpreadsheet size={24} />}
            </span>
            <strong>{item.label}</strong>
            <span className="file-name">{item.file?.name ?? item.hint}</span>
            <span className="file-choose">
              <FolderOpen size={14} />
              {item.file ? 'Change file' : 'Choose CSV file'}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label={item.label}
              disabled={busy}
              onChange={(e) => {
                item.set(e.target.files?.[0] ?? null);
                setError('');
              }}
            />
          </label>
        ))}
      </div>
      <details className="csv-help">
        <summary>CSV format & validation</summary>
        <p>
          Original: <code>id,name,salary,joinedDate,role,projectCompletion</code>
        </p>
        <p>
          Updated: <code>id,name,originalSalary,updatedSalary</code>
        </p>
        <p>
          Dates use YYYY-MM-DD. Completion is a fraction from 0 to 1. IDs must be unique and match
          across files, along with names and original salaries. Quoted fields are supported. Up to
          50,000 records and 10 MB per file.
        </p>
      </details>
      {error && (
        <div className="error-message" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      <div className="modal-actions">
        <button
          className="button secondary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await restoreSnapshot();
            onClose();
          }}
        >
          Use project snapshot
        </button>
        <button
          className="button primary"
          disabled={!original || !updated || busy}
          onClick={() => void importFiles()}
        >
          {busy ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
          {busy ? 'Validating files…' : 'Import & explore'}
        </button>
      </div>
      {dataset && (
        <div className="import-current">
          <span>
            Current workspace: {dataset.employees.length} employees ·{' '}
            {dataset.source === 'snapshot' ? 'project snapshot' : 'imported CSV pair'}
          </span>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setDataset(null);
              onClose();
            }}
          >
            Clear data
          </button>
        </div>
      )}
    </Modal>
  );
}
