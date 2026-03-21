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
    if (status === 'completed') return <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>;
    return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('missing')} {status.toLocaleString()}</span>;
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>{t('loading')}</div>;
  if (!data) return null;

  return (
    <div>
      <h2 style={styles.title}>{t('dashboard')}</h2>

      {/* Admin filter */}
      {isAdmin && (
        <form onSubmit={handleFilter} style={styles.filterRow}>
          <input
            type="text"
            placeholder="Filter by user code..."
            value={filterCode}
            onChange={e => setFilterCode(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.btn}>{t('search')}</button>
          <button type="button" style={styles.btnSecondary} onClick={() => { setFilterCode(''); fetchDashboard(); }}>{t('clear')}</button>
        </form>
      )}

      {/* User info */}
      {data.user_info && (
        <div style={styles.infoCard}>
          <span><strong>{t('code')}:</strong> {data.user_info.user_code}</span>
          <span><strong>{t('email')}:</strong> {data.user_info.email}</span>
          <span><strong>{t('name')}:</strong> {data.user_info.first_name} {data.user_info.last_name}</span>
        </div>
      )}

      {/* Max levels */}
      <div style={styles.levelsRow}>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel1')}</div><div style={styles.levelValue}>{data.max_levels.max_level1 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel2')}</div><div style={styles.levelValue}>{data.max_levels.max_level2 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel3')}</div><div style={styles.levelValue}>{data.max_levels.max_level3 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('globalMax')}</div><div style={styles.levelValue}>{data.global_max}</div></div>
      </div>

      {/* Accounts table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
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
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noAccountsFound')}</td></tr>
            ) : data.accounts.map(acc => (
              <tr key={acc.account_number} style={styles.tr}>
                <td style={styles.td}>{acc.account_number}</td>
                <td style={styles.td}>#{acc.user_code}</td>
                {isAdmin && <td style={styles.td}>{acc.first_name} {acc.last_name}</td>}
                <td style={styles.td}>{renderStatus(acc.level2_status)}</td>
                <td style={styles.td}>{renderStatus(acc.level3_status)}</td>
                <td style={styles.td}>{renderStatus(acc.complete_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Balance summary */}
      <div style={styles.balanceRow}>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('pendingBalance')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.pending_collection_amount || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('amountRequested')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.amount_requested || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('totalCollected')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.collected_amount || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('commissionsPaid')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.paid_commissions || 0)).toFixed(2)} USDC</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 },
  filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' },
  input: { padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', width: '220px' },
  btn: { padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  btnSecondary: { padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  infoCard: { background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', gap: '2rem', marginBottom: '1.5rem', color: '#475569', fontSize: '0.9rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  levelsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  levelCard: { background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '8px', flex: 1, minWidth: '120px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  levelLabel: { color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 },
  levelValue: { color: '#f59e0b', fontSize: '1.5rem', fontWeight: 700 },
  tableWrapper: { background: '#ffffff', borderRadius: '8px', overflow: 'auto', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', color: '#0f172a', fontSize: '0.875rem' },
  balanceRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  balanceCard: { background: '#ffffff', padding: '1.5rem', borderRadius: '8px', flex: 1, minWidth: '180px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  balanceLabel: { color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 },
  balanceValue: { color: '#10b981', fontSize: '1.4rem', fontWeight: 700 }
};
