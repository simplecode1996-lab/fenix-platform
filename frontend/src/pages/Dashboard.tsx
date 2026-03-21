import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Account {
  account_number: number;
  user_code: number;
  first_name?: string;
  last_name?: string;
  level_1_date: string;
  level_2_date: string | null;
  level_3_date: string | null;
  level2_status: number | 'completed';
  level3_status: number | 'completed';
  complete_status: number | 'completed';
}

interface DashboardData {
  user_info: any;
  max_levels: { max_level1: number; max_level2: number; max_level3: number };
  global_max: number;
  accounts: Account[];
  balance_summary: { 
    pending_collection_amount: number; 
    collected_amount: number; 
    paid_commissions: number;
    amount_requested: number;
  };
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterCode, setFilterCode] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async (code?: string) => {
    setLoading(true);
    try {
      const params = code ? `?user_code=${code}` : '';
      const res = await api.get(`/dashboard${params}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard(filterCode || undefined);
  };

  const renderStatus = (status: number | 'completed') => {
    if (status === 'completed') return <span style={{ color: '#10b981', fontSize: '1.5rem' }}>●</span>;
    return <span className="badge badge-neutral">{t('missing')} {status.toLocaleString()}</span>;
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>{t('loading')}</div>;
  if (!data) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{t('dashboard')}</h2>

      {/* Admin filter */}
      {isAdmin && (
        <form onSubmit={handleFilter} style={styles.filterRow}>
          <input
            type="text"
            placeholder="Filtrar por código de usuario..."
            value={filterCode}
            onChange={e => setFilterCode(e.target.value)}
            style={styles.input}
          />
          <button type="submit" className="btn btn-primary">{t('search')}</button>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilterCode(''); fetchDashboard(); }}>{t('clear')}</button>
        </form>
      )}

      {/* User info */}
      {data.user_info && (
        <div className="card" style={styles.infoCard}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{t('code')}:</span>
            <span style={styles.infoValue}>#{data.user_info.user_code}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{t('email')}:</span>
            <span style={styles.infoValue}>{data.user_info.email}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>{t('name')}:</span>
            <span style={styles.infoValue}>{data.user_info.first_name} {data.user_info.last_name}</span>
          </div>
        </div>
      )}

      {/* Max levels - Stats Grid */}
      <div style={styles.statsGrid}>
        <div className="stat-card slide-in">
          <div style={styles.statIcon}>📊</div>
          <div className="stat-label">{t('maxLevel1')}</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{data.max_levels.max_level1 || 0}</div>
        </div>
        <div className="stat-card slide-in" style={{ animationDelay: '0.1s' }}>
          <div style={styles.statIcon}>📈</div>
          <div className="stat-label">{t('maxLevel2')}</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{data.max_levels.max_level2 || 0}</div>
        </div>
        <div className="stat-card slide-in" style={{ animationDelay: '0.2s' }}>
          <div style={styles.statIcon}>🎯</div>
          <div className="stat-label">{t('maxLevel3')}</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{data.max_levels.max_level3 || 0}</div>
        </div>
        <div className="stat-card slide-in" style={{ animationDelay: '0.3s' }}>
          <div style={styles.statIcon}>✨</div>
          <div className="stat-label">{t('globalMax')}</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{data.global_max}</div>
        </div>
      </div>

      {/* Accounts table */}
      <div className="card" style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Cuentas</h3>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>{t('accountNumber')}</th>
                <th style={styles.th}>{t('userCode')}</th>
                {isAdmin && <th style={styles.th}>{t('name')}</th>}
                <th style={styles.th}>{t('level2')}</th>
                <th style={styles.th}>{t('level3')}</th>
                <th style={styles.th}>{t('complete')}</th>
              </tr>
            </thead>
            <tbody>
              {data.accounts.length === 0 ? (
                <tr><td colSpan={6} style={styles.emptyState}>{t('noAccountsFound')}</td></tr>
              ) : data.accounts.map(acc => (
                <tr key={acc.account_number}>
                  <td style={styles.td}>
                    <span style={styles.accountNumber}>#{acc.account_number}</span>
                  </td>
                  <td style={styles.td}>
                    <span className="badge badge-neutral">#{acc.user_code}</span>
                  </td>
                  {isAdmin && <td style={styles.td}>{acc.first_name} {acc.last_name}</td>}
                  <td style={styles.td}>{renderStatus(acc.level2_status)}</td>
                  <td style={styles.td}>{renderStatus(acc.level3_status)}</td>
                  <td style={styles.td}>{renderStatus(acc.complete_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance summary */}
      <div style={styles.balanceGrid}>
        <div className="stat-card">
          <div className="stat-label">{t('pendingBalance')}</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {parseFloat(String(data.balance_summary.pending_collection_amount || 0)).toFixed(2)}
          </div>
          <div style={styles.currency}>USDC</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('amountRequested')}</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {parseFloat(String(data.balance_summary.amount_requested || 0)).toFixed(2)}
          </div>
          <div style={styles.currency}>USDC</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('totalCollected')}</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {parseFloat(String(data.balance_summary.collected_amount || 0)).toFixed(2)}
          </div>
          <div style={styles.currency}>USDC</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t('commissionsPaid')}</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {parseFloat(String(data.balance_summary.paid_commissions || 0)).toFixed(2)}
          </div>
          <div style={styles.currency}>USDC</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1400px', margin: '0 auto' },
  title: { color: '#f59e0b', marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 700 },
  filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' },
  input: { padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9375rem', width: '240px', transition: 'all 0.2s' },
  infoCard: { padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  infoLabel: { color: '#64748b', fontSize: '0.8125rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoValue: { color: '#0f172a', fontSize: '1rem', fontWeight: 600 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' },
  statIcon: { fontSize: '2rem', marginBottom: '0.5rem' },
  tableCard: { marginBottom: '2rem', overflow: 'hidden' },
  tableHeader: { padding: '1.5rem', borderBottom: '1px solid #e2e8f0' },
  tableTitle: { color: '#0f172a', fontSize: '1.125rem', fontWeight: 600, margin: 0 },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
  th: { padding: '1rem 1.5rem', textAlign: 'left', color: '#64748b', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem 1.5rem', color: '#0f172a', fontSize: '0.9375rem', borderBottom: '1px solid #f1f5f9' },
  accountNumber: { fontWeight: 600, color: '#3b82f6' },
  emptyState: { textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.9375rem' },
  balanceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' },
  currency: { color: '#64748b', fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }
};
