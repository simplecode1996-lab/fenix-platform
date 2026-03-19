import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function InitialGeneration() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/process/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRun = async (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`⚠ This is a one-time process. Continue?`)) return;
    
    setLoading(true);
    setMessage('');
    setError('');
    setResult(null);

    try {
      const res = await api.post('/process/initial-generation');
      setResult(res.data);
      setMessage(res.data.message);
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const hasAccounts = stats && parseInt(stats.accounts.total_accounts) > 0;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={styles.title}>Initial Account Generation</h2>
      <p style={styles.subtitle}>
        One-time process to create initial accounts for existing users
      </p>

      {stats && (
        <div style={styles.statsCard}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Total Users:</span>
            <span style={styles.statValue}>{stats.users.total_users}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>{t('registeredAccounts')}:</span>
            <span style={styles.statValue}>{stats.users.total_registered_accounts}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>Existing Accounts:</span>
            <span style={{ ...styles.statValue, color: hasAccounts ? '#22c55e' : '#94a3b8' }}>
              {stats.accounts.total_accounts}
            </span>
          </div>
        </div>
      )}

      {hasAccounts ? (
        <div style={styles.warningBox}>
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>⚠ Already Run</h3>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
            This process has already been executed. There are {stats.accounts.total_accounts} accounts in the system.
          </p>
        </div>
      ) : (
        <form onSubmit={handleRun} style={styles.form}>
          <h3 style={styles.formTitle}>Run Initial Generation</h3>
          <p style={styles.description}>
            This will create accounts for all existing users based on their registered_accounts_count.
          </p>

          {message && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</p>}
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? t('processing') : 'Run Process'}
          </button>
        </form>
      )}

      {result && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>✓ Process Completed</h3>
          <div style={styles.resultGrid}>
            <div><span style={styles.resultLabel}>Total Accounts Created:</span><span style={styles.resultValue}>{result.total_accounts_created}</span></div>
            <div><span style={styles.resultLabel}>Users Processed:</span><span style={styles.resultValue}>{result.users_processed}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 700 },
  subtitle: { color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' },
  statsCard: { background: '#ffffff', padding: '1.5rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  statRow: { display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem' },
  statLabel: { color: '#64748b', fontWeight: 500 },
  statValue: { color: '#0f172a', fontWeight: 600 },
  warningBox: { background: '#fef2f2', border: '2px solid #fecaca', padding: '1.5rem', borderRadius: '10px' },
  form: { background: '#ffffff', padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  formTitle: { color: '#0f172a', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 },
  description: { color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.5rem' },
  btn: { padding: '0.85rem 2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  resultCard: { background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  resultTitle: { color: '#10b981', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  resultLabel: { color: '#64748b', fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem', fontWeight: 500 },
  resultValue: { color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }
};
