import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Accounts() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [userCode, setUserCode] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load all users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/users');
        setAllUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    loadUsers();
  }, []);

  // Live search filter
  useEffect(() => {
    if (!email && !userCode) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = allUsers.filter(u =>
      (email && u.email.toLowerCase().includes(email.toLowerCase())) ||
      (userCode && String(u.user_code).includes(userCode))
    );
    setFilteredUsers(filtered);
  }, [email, userCode, allUsers]);

  const selectUser = (user: any) => {
    setFoundUser(user);
    setFilteredUsers([]);
    setEmail('');
    setUserCode('');
    setError('');
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!foundUser) { setError(t('userNotFound')); return; }
    if (!window.confirm(`${t('create')} account for ${foundUser.first_name} ${foundUser.last_name}?`)) return;
    setLoading(true); setMessage(''); setError('');
    try {
      const res = await api.post('/accounts', { user_code: foundUser.user_code });
      setMessage(`${t('accountCreated')} #${res.data.account.account_number}`);
      // Refresh user data
      const updated = await api.get(`/users/${foundUser.user_code}`);
      setFoundUser(updated.data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px' }}>
      <h2 style={styles.title}>{t('userAccounts')}</h2>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>{t('searchUser')}</h3>
        <div style={styles.searchRow}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              placeholder={t('email')} 
              value={email} 
              onChange={e => { setEmail(e.target.value); setUserCode(''); setFoundUser(null); }}
              style={styles.input} 
            />
            {filteredUsers.length > 0 && email && (
              <div style={styles.dropdown}>
                {filteredUsers.map(u => (
                  <div key={u.user_code} style={styles.dropdownItem} onClick={() => selectUser(u)}>
                    <strong>#{u.user_code}</strong> - {u.email} ({u.first_name} {u.last_name})
                  </div>
                ))}
              </div>
            )}
          </div>
          <span style={{ color: '#94a3b8' }}>o</span>
          <div style={{ position: 'relative' }}>
            <input 
              placeholder={t('userCode')} 
              value={userCode} 
              onChange={e => { setUserCode(e.target.value); setEmail(''); setFoundUser(null); }}
              style={{ ...styles.input, width: '140px' }} 
            />
            {filteredUsers.length > 0 && userCode && (
              <div style={styles.dropdown}>
                {filteredUsers.map(u => (
                  <div key={u.user_code} style={styles.dropdownItem} onClick={() => selectUser(u)}>
                    <strong>#{u.user_code}</strong> - {u.email} ({u.first_name} {u.last_name})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {foundUser && (
          <div style={styles.userInfo}>
            <div style={styles.infoRow}><span style={styles.infoLabel}>{t('code')}:</span> #{foundUser.user_code}</div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>{t('name')}:</span> {foundUser.first_name} {foundUser.last_name}</div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>{t('email')}:</span> {foundUser.email}</div>
            <div style={styles.infoRow}><span style={styles.infoLabel}>{t('registeredAccounts')}:</span>
              <span style={{ color: foundUser.registered_accounts_count >= foundUser.allowed_accounts_count ? '#ef4444' : '#22c55e' }}>
                {foundUser.registered_accounts_count} / {foundUser.allowed_accounts_count}
              </span>
            </div>
          </div>
        )}
      </div>

      {foundUser && (
        <form onSubmit={handleCreate} style={styles.card}>
          <h3 style={styles.sectionTitle}>{t('createAccountTitle')}</h3>
          <div style={styles.detailsGrid}>
            <div><span style={styles.infoLabel}>{t('paidAmount')}:</span> <span style={{ color: '#f59e0b' }}>45 USDC</span></div>
            <div><span style={styles.infoLabel}>{t('investmentAmount')}:</span> <span style={{ color: '#f59e0b' }}>25 USDC</span></div>
            <div><span style={styles.infoLabel}>{t('level1Date')}:</span> <span style={{ color: '#22c55e' }}>{t('today')}</span></div>
          </div>
          {message && <p style={{ color: '#22c55e', marginTop: '1rem' }}>{message}</p>}
          {error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? t('loading') : t('create')}
          </button>
        </form>
      )}

      {!foundUser && error && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700 },
  card: { background: '#ffffff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  sectionTitle: { color: '#0f172a', marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 },
  searchRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  input: { padding: '0.65rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', flex: 1 },
  btn: { padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  userInfo: { marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  infoRow: { color: '#475569', fontSize: '0.9rem', marginBottom: '0.4rem' },
  infoLabel: { color: '#64748b', marginRight: '0.5rem', fontWeight: 500 },
  detailsGrid: { display: 'flex', gap: '2rem', flexWrap: 'wrap', color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' },
  dropdown: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '0.25rem', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', zIndex: 10 },
  dropdownItem: { padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem', color: '#0f172a', transition: 'background 0.2s' }
};
