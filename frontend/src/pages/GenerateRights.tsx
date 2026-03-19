import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function GenerateRights() {
  const { t } = useLanguage();
  const [numberOfPayments, setNumberOfPayments] = useState('10');
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

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    const num = parseInt(numberOfPayments);
    if (num < 1) {
      setError('Number must be at least 1');
      return;
    }
    if (!window.confirm(`${t('generateCollectionRights')} ${num} payments?`)) return;
    
    setLoading(true);
    setMessage('');
    setError('');
    setResult(null);
    
    try {
      const res = await api.post('/process/generate-rights', { number_of_payments: num });
      setResult(res.data);
      setMessage(res.data.message);
      fetchStats(); // Refresh stats
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h2 style={styles.title}>{t('generateRights')}</h2>
      <p style={styles.subtitle}>
        {t('generateRightsSubtitle')}
      </p>

      {/* Statistics */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>{t('totalAccounts')}</div>
            <div style={styles.statValue}>{stats.accounts.total_accounts}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>{t('level3Pending')}</div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.accounts.pending_level_3}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>{t('level3Processed')}</div>
            <div style={{ ...styles.statValue, color: '#22c55e' }}>{stats.accounts.processed_level_3}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>{t('totalPendingBalance')}</div>
            <div style={{ ...styles.statValue, color: '#22c55e' }}>
              {parseFloat(stats.users.total_pending || '0').toFixed(2)} USDC
            </div>
          </div>
        </div>
      )}

      {/* Generation Form */}
      <form onSubmit={handleGenerate} style={styles.form}>
        <h3 style={styles.formTitle}>{t('generatePayments')}</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>{t('numberOfPayments')}</label>
          <input
            type="number"
            min="1"
            value={numberOfPayments}
            onChange={e => setNumberOfPayments(e.target.value)}
            style={styles.input}
            required
          />
          <p style={styles.hint}>
            {t('paymentsHint')}
          </p>
        </div>

        {message && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</p>}
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

        <button type="submit" style={styles.btn} disabled={loading}>
          {loading ? t('processing') : t('generateCollectionRights')}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div style={styles.resultCard}>
          <h3 style={styles.resultTitle}>{t('processResults')}</h3>
          <div style={styles.resultGrid}>
            <div><span style={styles.resultLabel}>{t('paymentsGenerated')}:</span> <strong>{result.payments_generated}</strong></div>
            <div><span style={styles.resultLabel}>{t('requested')}:</span> {result.number_of_payments || numberOfPayments}</div>
            <div><span style={styles.resultLabel}>{t('accountsProcessed')}:</span> {result.processed_accounts?.length || 0}</div>
          </div>
          
          {result.processed_accounts && result.processed_accounts.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={styles.resultLabel}>{t('processedAccountNumbers')}:</div>
              <div style={styles.accountList}>
                {result.processed_accounts.map((acc: number) => (
                  <span key={acc} style={styles.accountBadge}>#{acc}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 700 },
  subtitle: { color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  statCard: { background: '#ffffff', padding: '1.25rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  statLabel: { color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 },
  statValue: { color: '#0f172a', fontSize: '1.8rem', fontWeight: 700 },
  form: { background: '#ffffff', padding: '2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  formTitle: { color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 },
  label: { display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 },
  input: { width: '100%', maxWidth: '300px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '1rem', boxSizing: 'border-box' },
  hint: { color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' },
  btn: { padding: '0.85rem 2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  resultCard: { background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  resultTitle: { color: '#10b981', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 },
  resultGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' },
  resultLabel: { color: '#64748b', marginRight: '0.5rem', fontWeight: 500 },
  accountList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' },
  accountBadge: { background: '#f1f5f9', color: '#0f172a', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #e2e8f0' }
};
