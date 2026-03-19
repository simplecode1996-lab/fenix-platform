import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function RequestPayment() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/users/${user?.user_code}`).then(res => setUserData(res.data));
  }, []);

  const net = amount ? (parseFloat(amount) * 0.98).toFixed(2) : '0.00';
  const commission = amount ? (parseFloat(amount) * 0.02).toFixed(2) : '0.00';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`${t('requestPayment')} ${amount} USDC?`)) return;
    setLoading(true); setMessage(''); setError('');
    try {
      await api.post('/payments/request', { requested_amount: parseFloat(amount) });
      setMessage(`${t('requestSubmitted')} ${amount} USDC`);
      setAmount('');
      const updated = await api.get(`/users/${user?.user_code}`);
      setUserData(updated.data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <div style={{ color: '#94a3b8' }}>{t('loading')}</div>;

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2 style={styles.title}>{t('requestPayment')}</h2>

      <div style={styles.card}>
        <div style={styles.infoRow}><span style={styles.label}>{t('name')}:</span> {userData.first_name} {userData.last_name}</div>
        <div style={styles.infoRow}><span style={styles.label}>{t('wallet')}:</span> {userData.wallet || <span style={{ color: '#ef4444' }}>Not set</span>}</div>
        <div style={styles.infoRow}>
          <span style={styles.label}>{t('availableBalance')}:</span>
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '1.2rem' }}>
            {parseFloat(userData.pending_collection_amount).toFixed(2)} USDC
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={styles.label}>{t('amountToRequest')}</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={userData.pending_collection_amount}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={styles.input}
            placeholder="0.00"
            required
          />
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div style={styles.breakdown}>
            <div style={styles.breakdownRow}><span>{t('requested')}:</span><span>{parseFloat(amount).toFixed(2)} USDC</span></div>
            <div style={styles.breakdownRow}><span>{t('commission')}:</span><span style={{ color: '#ef4444' }}>- {commission} USDC</span></div>
            <div style={{ ...styles.breakdownRow, borderTop: '1px solid #334155', paddingTop: '0.5rem', fontWeight: 700 }}>
              <span>{t('youReceive')}:</span><span style={{ color: '#22c55e' }}>{net} USDC</span>
            </div>
          </div>
        )}

        {message && <p style={{ color: '#22c55e' }}>{message}</p>}
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <button type="submit" style={styles.btn} disabled={loading || !userData.wallet}>
          {loading ? t('loading') : t('submit')}
        </button>
        {!userData.wallet && <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{t('setWalletFirst')}</p>}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700 },
  card: { background: '#ffffff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  infoRow: { color: '#475569', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' },
  label: { color: '#64748b', minWidth: '130px', fontWeight: 500 },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '1rem', boxSizing: 'border-box' },
  breakdown: { background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' },
  breakdownRow: { display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.9rem', marginBottom: '0.5rem' },
  btn: { width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' }
};
