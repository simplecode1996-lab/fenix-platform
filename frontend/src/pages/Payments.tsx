import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Payments() {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<any[]>([]);
  const [filterCode, setFilterCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPayments = async (code?: string) => {
    setLoading(true);
    try {
      const params = code ? `?user_code=${code}` : '';
      const res = await api.get(`/payments${params}`);
      setPayments(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleComplete = async (payment_id: number) => {
    if (!window.confirm(t('confirmAction'))) return;
    try {
      await api.put(`/payments/${payment_id}/complete`, { payment_date: new Date().toISOString() });
      setMessage(t('successMessage'));
      fetchPayments(filterCode || undefined);
    } catch (err: any) {
      setMessage(err.response?.data?.error || t('errorOccurred'));
    }
  };

  return (
    <div>
      <h2 style={styles.title}>{t('payments')}</h2>

      <div style={styles.filterRow}>
        <input placeholder="Filter by user code..." value={filterCode}
          onChange={e => setFilterCode(e.target.value)} style={styles.input} />
        <button onClick={() => fetchPayments(filterCode || undefined)} style={styles.btn}>{t('search')}</button>
        <button onClick={() => { setFilterCode(''); fetchPayments(); }} style={styles.btnSecondary}>{t('clear')}</button>
      </div>

      {message && <p style={{ color: '#22c55e', marginBottom: '1rem' }}>{message}</p>}

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>{t('name')}</th>
              <th style={styles.th}>{t('requestDate')}</th>
              <th style={styles.th}>{t('requested')}</th>
              <th style={styles.th}>{t('netAmount')}</th>
              <th style={styles.th}>{t('commission')}</th>
              <th style={styles.th}>{t('paymentDate')}</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('loading')}</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noPendingPayments')}</td></tr>
            ) : payments.map(p => (
              <tr key={p.payment_id} style={styles.tr}>
                <td style={styles.td}>#{p.payment_id}</td>
                <td style={styles.td}>{p.first_name} {p.last_name}<br /><span style={{ color: '#64748b', fontSize: '0.8rem' }}>#{p.user_code}</span></td>
                <td style={styles.td}>{new Date(p.request_date).toLocaleDateString()}</td>
                <td style={styles.td}>{parseFloat(p.requested_amount).toFixed(2)}</td>
                <td style={{ ...styles.td, color: '#22c55e' }}>{parseFloat(p.net_amount).toFixed(2)}</td>
                <td style={{ ...styles.td, color: '#ef4444' }}>{parseFloat(p.commission_amount).toFixed(2)}</td>
                <td style={styles.td}>
                  {p.payment_date
                    ? <span style={{ color: '#22c55e' }}>{new Date(p.payment_date).toLocaleDateString()}</span>
                    : <span style={{ color: '#f59e0b' }}>{t('pending')}</span>}
                </td>
                <td style={styles.td}>
                  {!p.payment_date && (
                    <button onClick={() => handleComplete(p.payment_id)} style={styles.completeBtn}>
                      {t('markPaid')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.75rem' },
  filterRow: { display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' },
  input: { flex: 1, padding: '0.875rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', transition: 'all 0.2s' },
  btn: { padding: '0.875rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  btnSecondary: { padding: '0.875rem 1.5rem', background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' },
  tableWrapper: { background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' },
  th: { padding: '1rem 1.25rem', textAlign: 'left', color: '#92400e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '1rem 1.25rem', color: '#0f172a', fontSize: '0.9rem', fontWeight: 500 },
  completeBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)', transition: 'all 0.2s', whiteSpace: 'nowrap' }
};
