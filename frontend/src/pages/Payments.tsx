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
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700 },
  filterRow: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' },
  input: { padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', width: '220px' },
  btn: { padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  btnSecondary: { padding: '0.6rem 1.2rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' },
  tableWrapper: { background: '#ffffff', borderRadius: '8px', overflow: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', color: '#0f172a', fontSize: '0.875rem' },
  completeBtn: { padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)' }
};
