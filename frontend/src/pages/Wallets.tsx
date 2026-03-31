import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import api from '../services/api';

export default function Wallets() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ currency: '', wallet_address: '', network: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
    } catch (err) {
      console.error('Failed to load wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.currency || !form.wallet_address || !form.network) {
      setError(t('allFieldsRequired'));
      return;
    }

    setMessage(''); setError('');
    try {
      if (editingId) {
        await api.put(`/wallets/${editingId}`, form);
        setMessage(t('walletUpdated'));
      } else {
        await api.post('/wallets', form);
        setMessage(t('walletCreated'));
      }
      
      setForm({ currency: '', wallet_address: '', network: '' });
      setShowForm(false);
      setEditingId(null);
      loadWallets();
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    }
  };

  const handleEdit = (wallet: any) => {
    setForm({
      currency: wallet.currency,
      wallet_address: wallet.wallet_address,
      network: wallet.network || ''
    });
    setEditingId(wallet.wallet_id);
    setShowForm(true);
    setMessage(''); setError('');
  };

  const handleDelete = async (walletId: number) => {
    if (!window.confirm(t('confirmAction'))) return;
    
    setMessage(''); setError('');
    try {
      await api.delete(`/wallets/${walletId}`);
      setMessage(t('walletDeleted'));
      loadWallets();
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    }
  };

  const cancelForm = () => {
    setForm({ currency: '', wallet_address: '', network: '' });
    setShowForm(false);
    setEditingId(null);
    setMessage(''); setError('');
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{t('fenixWallets')}</h2>
          <p style={styles.subtitle}>
            {isAdmin ? t('manageWallets') : t('walletsSubtitle')}
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            style={styles.addBtn}
            className="btn-primary"
          >
            <Plus size={18} />
            {t('addWallet')}
          </button>
        )}
      </div>

      {/* Admin Form */}
      {isAdmin && showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3 style={styles.formTitle}>
              {editingId ? t('editWallet') : t('addWallet')}
            </h3>
            <button onClick={cancelForm} style={styles.closeBtn}>
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('currency')}</label>
                <select
                  value={form.currency}
                  onChange={e => setForm({...form, currency: e.target.value})}
                  style={styles.input}
                  required
                >
                  <option value="">{t('selectCurrency')}</option>
                  <option value="USDT">USDT</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>{t('network')}</label>
                <input
                  type="text"
                  value={form.network}
                  onChange={e => setForm({...form, network: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Ethereum, Polygon, BSC"
                  required
                />
              </div>
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>{t('walletAddress')}</label>
              <input
                type="text"
                value={form.wallet_address}
                onChange={e => setForm({...form, wallet_address: e.target.value})}
                style={styles.input}
                placeholder="0x..."
                required
              />
            </div>
            
            <div style={styles.formActions}>
              <button type="submit" style={styles.saveBtn}>
                <Save size={16} />
                {editingId ? t('update') : t('create')} {t('wallet')}
              </button>
              <button type="button" onClick={cancelForm} style={styles.cancelBtn}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages */}
      {message && <div style={styles.successMessage}>{message}</div>}
      {error && <div style={styles.errorMessage}>{error}</div>}

      {/* Wallets List */}
      {loading ? (
        <p style={{ color: '#94a3b8' }}>{t('loading')}</p>
      ) : wallets.length === 0 ? (
        <p style={{ color: '#94a3b8' }}>{t('noWalletsConfigured')}</p>
      ) : (
        <div style={styles.walletsGrid}>
          {wallets.map(w => (
            <div key={w.wallet_id} style={styles.walletCard}>
              <div style={styles.walletHeader}>
                <div style={styles.currency}>{w.currency}</div>
                {w.network && <div style={styles.network}>{w.network}</div>}
                {isAdmin && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => handleEdit(w)}
                      style={styles.editBtn}
                      title={t('editWallet')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(w.wallet_id)}
                      style={styles.deleteBtn}
                      title={t('deleteWallet')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div style={styles.address}>{w.wallet_address}</div>
              
              <button 
                onClick={() => navigator.clipboard.writeText(w.wallet_address)} 
                style={styles.copyBtn}
              >
                {t('copy')}
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdmin && (
        <div style={styles.notice}>
          {t('walletsNotice')}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    gap: '1rem'
  },
  title: { 
    color: '#f59e0b', 
    marginBottom: '0.5rem', 
    fontWeight: 700, 
    fontSize: '1.75rem' 
  },
  subtitle: { 
    color: '#64748b', 
    fontSize: '0.95rem',
    lineHeight: 1.5
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  formCard: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '0',
    marginBottom: '2rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderBottom: '1px solid #e2e8f0'
  },
  formTitle: {
    color: '#0f172a',
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  form: {
    padding: '2rem'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  inputGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    color: '#374151',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    background: '#f8fafc',
    color: '#0f172a',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  successMessage: {
    padding: '1rem 1.5rem',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '10px',
    color: '#059669',
    fontSize: '0.9rem',
    marginBottom: '1.5rem'
  },
  errorMessage: {
    padding: '1rem 1.5rem',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '0.9rem',
    marginBottom: '1.5rem'
  },
  walletsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  walletCard: { 
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
    padding: '1.5rem', 
    borderRadius: '16px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease'
  },
  walletHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    gap: '1rem'
  },
  currency: { 
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', 
    color: '#ffffff', 
    padding: '0.4rem 1rem', 
    borderRadius: '8px', 
    fontWeight: 700, 
    fontSize: '0.9rem',
    textAlign: 'center',
    minWidth: '70px'
  },
  network: {
    background: '#e0e7ff',
    color: '#3730a3',
    padding: '0.3rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    background: '#e0f2fe',
    color: '#0369a1',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  deleteBtn: {
    background: '#fef2f2',
    color: '#dc2626',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  address: { 
    color: '#0f172a', 
    fontFamily: 'monospace', 
    fontSize: '0.9rem', 
    wordBreak: 'break-all',
    background: '#f1f5f9',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0'
  },
  copyBtn: { 
    width: '100%',
    padding: '0.6rem 1rem', 
    background: '#f8fafc', 
    color: '#475569', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '0.9rem', 
    fontWeight: 600,
    transition: 'all 0.2s ease'
  },
  notice: { 
    background: '#fff7ed', 
    border: '1px solid #fed7aa', 
    padding: '1.25rem', 
    borderRadius: '12px', 
    color: '#d97706', 
    fontSize: '0.9rem',
    lineHeight: 1.6
  }
};
