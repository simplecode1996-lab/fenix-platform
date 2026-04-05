import { useState, useEffect, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Users as UsersIcon } from 'lucide-react';
import api from '../services/api';

export default function CreateUser() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    email: '', first_name: '', last_name: '', profile: 'user',
    wallet: '', phone: '', dni: '', allowed_accounts_count: 10, 
    registered_accounts_count: 0, password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Load users list
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm(t('confirmAction'))) return;
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await api.post('/users', form);
      setMessage(`${t('userCreatedSuccess')} ${res.data.user.user_code}`);
      
      // DON'T clear the form - keep the data for next user
      // Only clear email and password for security
      setForm({ 
        ...form, 
        email: '', 
        password: '' 
      });
      
      // Reload users list
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Left side - Form */}
      <div style={styles.leftPanel}>
        <h2 style={styles.title}>{t('createUser')}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.grid}>
            <Field label={`${t('email')} *`} name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label={`${t('password')} *`} name="password" type="password" value={form.password} onChange={handleChange} required />
            <Field label={`${t('firstName')} *`} name="first_name" value={form.first_name} onChange={handleChange} required />
            <Field label={`${t('lastName')} *`} name="last_name" value={form.last_name} onChange={handleChange} required />
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>{t('profile')} *</label>
              <select name="profile" value={form.profile} onChange={handleChange} style={{ ...styles.input, cursor: 'pointer' }} required>
                <option value="user">{t('user')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>
            <Field label={t('wallet')} name="wallet" value={form.wallet} onChange={handleChange} />
            <Field label={t('phone')} name="phone" value={form.phone} onChange={handleChange} />
            <Field label={t('dni')} name="dni" value={form.dni} onChange={handleChange} />
            <Field label={t('allowedAccounts')} name="allowed_accounts_count" type="number" value={String(form.allowed_accounts_count)} onChange={handleChange} />
            <Field label={t('registeredAccounts')} name="registered_accounts_count" type="number" value={String(form.registered_accounts_count)} onChange={handleChange} />
          </div>
          {message && <p style={styles.success}>{message}</p>}
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? t('loading') : t('create')}
          </button>
        </form>
      </div>

      {/* Right side - Users List */}
      <div style={styles.rightPanel}>
        <div style={styles.listHeader}>
          <UsersIcon size={20} />
          <h3 style={styles.listTitle}>{t('usersList')} ({users.length})</h3>
        </div>
        
        <div style={styles.usersList}>
          {users.length === 0 ? (
            <p style={styles.emptyText}>{t('noUsers')}</p>
          ) : (
            users.map(user => (
              <div key={user.user_code} style={styles.userCard}>
                <div style={styles.userHeader}>
                  <div style={styles.userAvatar}>
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{user.first_name} {user.last_name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                </div>
                <div style={styles.userMeta}>
                  <span style={{
                    ...styles.userBadge,
                    background: user.profile === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: user.profile === 'admin' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {user.profile === 'admin' ? t('admin') : t('user')}
                  </span>
                  <span style={styles.userCode}>#{user.user_code}</span>
                </div>
                <div style={styles.userStats}>
                  <span style={styles.statText}>
                    {user.registered_accounts_count}/{user.allowed_accounts_count} {t('accounts')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, required }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'all 0.2s' }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', gap: '1.5rem', maxWidth: '1400px', margin: '0 auto' },
  leftPanel: { flex: 1, minWidth: 0 },
  rightPanel: { width: '350px', flexShrink: 0 },
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.75rem' },
  form: { background: '#ffffff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  label: { display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'all 0.2s' },
  success: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid rgba(16, 185, 129, 0.2)' },
  error: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' },
  btn: { width: '100%', padding: '1rem 2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', transition: 'all 0.2s', marginTop: '1rem' },
  listHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#0f172a' },
  listTitle: { fontSize: '1.1rem', fontWeight: 700, margin: 0 },
  usersList: { background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  emptyText: { padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },
  userCard: { padding: '1rem', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  userHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
  userAvatar: { width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userMeta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' },
  userBadge: { padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' },
  userCode: { fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' },
  userStats: { fontSize: '0.8rem', color: '#64748b' },
  statText: { display: 'block' }
};
