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
    <div style={styles.container}>
      <h2 style={styles.title}>{t('userAccounts')}</h2>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>{t('searchUser')}</h3>
        <p style={styles.subtitle}>Busca por correo electrónico o código de usuario</p>
        
        <div style={styles.searchContainer}>
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input 
              placeholder="Buscar por email..." 
              value={email} 
              onChange={e => { setEmail(e.target.value); setUserCode(''); setFoundUser(null); }}
              style={styles.searchInput}
            />
            {filteredUsers.length > 0 && email && (
              <div style={styles.dropdown}>
                {filteredUsers.map(u => (
                  <div key={u.user_code} style={styles.dropdownItem} onClick={() => selectUser(u)}>
                    <div style={styles.dropdownItemHeader}>
                      <span style={styles.userCode}>#{u.user_code}</span>
                      <span style={styles.userName}>{u.first_name} {u.last_name}</span>
                    </div>
                    <div style={styles.userEmail}>{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span style={styles.orText}>o</span>

          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <input 
              placeholder="Código de usuario..." 
              value={userCode} 
              onChange={e => { setUserCode(e.target.value); setEmail(''); setFoundUser(null); }}
              style={styles.searchInput}
            />
            {filteredUsers.length > 0 && userCode && (
              <div style={styles.dropdown}>
                {filteredUsers.map(u => (
                  <div key={u.user_code} style={styles.dropdownItem} onClick={() => selectUser(u)}>
                    <div style={styles.dropdownItemHeader}>
                      <span style={styles.userCode}>#{u.user_code}</span>
                      <span style={styles.userName}>{u.first_name} {u.last_name}</span>
                    </div>
                    <div style={styles.userEmail}>{u.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {foundUser && (
          <div style={styles.userInfoCard}>
            <div style={styles.userInfoHeader}>
              <div style={styles.userAvatar}>
                {foundUser.first_name.charAt(0)}{foundUser.last_name.charAt(0)}
              </div>
              <div style={styles.userInfoMain}>
                <h4 style={styles.userInfoName}>{foundUser.first_name} {foundUser.last_name}</h4>
                <p style={styles.userInfoEmail}>{foundUser.email}</p>
              </div>
              <div style={styles.userCodeBadge}>#{foundUser.user_code}</div>
            </div>
            <div style={styles.userInfoStats}>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>{t('registeredAccounts')}</span>
                <span style={styles.statValue}>
                  {foundUser.registered_accounts_count} / {foundUser.allowed_accounts_count}
                </span>
              </div>
              <div style={styles.statDivider}></div>
              <div style={styles.statItem}>
                <span style={styles.statLabel}>Estado</span>
                <span style={{
                  ...styles.statBadge,
                  background: foundUser.registered_accounts_count >= foundUser.allowed_accounts_count 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(34, 197, 94, 0.1)',
                  color: foundUser.registered_accounts_count >= foundUser.allowed_accounts_count 
                    ? '#ef4444' 
                    : '#22c55e'
                }}>
                  {foundUser.registered_accounts_count >= foundUser.allowed_accounts_count ? 'Límite alcanzado' : 'Disponible'}
                </span>
              </div>
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
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.75rem' },
  card: { background: '#ffffff', padding: '2rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  sectionTitle: { color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 600 },
  subtitle: { color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' },
  searchContainer: { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' },
  inputWrapper: { flex: 1, position: 'relative' },
  inputIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 },
  searchInput: { width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', transition: 'all 0.2s' },
  orText: { color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 },
  dropdown: { position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', maxHeight: '280px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', zIndex: 10 },
  dropdownItem: { padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  dropdownItemHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' },
  userCode: { background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 },
  userName: { color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' },
  userEmail: { color: '#64748b', fontSize: '0.8rem', marginLeft: '2.5rem' },
  userInfoCard: { background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #fbbf24' },
  userInfoHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' },
  userAvatar: { width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' },
  userInfoMain: { flex: 1 },
  userInfoName: { color: '#0f172a', fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' },
  userInfoEmail: { color: '#64748b', fontSize: '0.875rem' },
  userCodeBadge: { background: '#ffffff', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' },
  userInfoStats: { display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '10px' },
  statItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  statLabel: { color: '#64748b', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' },
  statValue: { color: '#0f172a', fontSize: '1.125rem', fontWeight: 700 },
  statDivider: { width: '1px', height: '40px', background: '#e2e8f0' },
  statBadge: { padding: '0.375rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 },
  btn: { padding: '0.875rem 1.5rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', transition: 'all 0.2s' },
  detailsGrid: { display: 'flex', gap: '2rem', flexWrap: 'wrap', color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }
};
