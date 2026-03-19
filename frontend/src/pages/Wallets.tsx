import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Wallets() {
  const { t } = useLanguage();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallets').then(res => { setWallets(res.data); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={styles.title}>{t('fenixWallets')}</h2>
      <p style={styles.subtitle}>{t('walletsSubtitle')}</p>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>{t('loading')}</p>
      ) : wallets.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>{t('noWalletsConfigured')}</p>
      ) : (
        <div>
          {wallets.map(w => (
            <div key={w.wallet_id} style={styles.walletCard}>
              <div style={styles.currency}>{w.currency}</div>
              <div style={styles.address}>{w.wallet_address}</div>
              <button onClick={() => navigator.clipboard.writeText(w.wallet_address)} style={styles.copyBtn}>
                {t('copy')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.notice}>
        {t('walletsNotice')}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '0.5rem', fontWeight: 700 },
  subtitle: { color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' },
  walletCard: { background: '#ffffff', padding: '1.25rem 1.5rem', borderRadius: '10px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  currency: { background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem', minWidth: '60px', textAlign: 'center' },
  address: { flex: 1, color: '#0f172a', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' },
  copyBtn: { padding: '0.4rem 0.9rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  notice: { background: '#fff7ed', border: '1px solid #fed7aa', padding: '1rem', borderRadius: '8px', color: '#d97706', fontSize: '0.85rem', marginTop: '1.5rem' }
};
