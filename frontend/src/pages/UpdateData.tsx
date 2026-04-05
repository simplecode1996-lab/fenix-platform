import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function UpdateData() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  // Admin reset password state
  const [showAdminReset, setShowAdminReset] = useState(false);
  const [adminResetPassword, setAdminResetPassword] = useState('');

  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then(res => setUsers(res.data));
    } else {
      api.get(`/users/${user?.user_code}`).then(res => {
        setSelected(res.data);
        setForm(res.data);
      });
    }
  }, []);

  // Show all users initially, then filter as user types
  useEffect(() => {
    if (!isAdmin) {
      setFilteredUsers([]);
      return;
    }
    
    if (!searchTerm) {
      // Show all users when no search term
      setFilteredUsers(users);
      return;
    }
    
    // Filter as user types
    const filtered = users.filter(u =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.user_code).includes(searchTerm) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users, isAdmin]);

  const selectUser = (u: any) => {
    setSelected(u);
    setForm({ ...u });
    setMessage(''); setError('');
    setShowPasswordChange(false);
    setShowAdminReset(false);
    setFilteredUsers([]);
    setSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!window.confirm(t('confirmAction'))) return;
    setMessage(''); setError('');
    try {
      await api.put(`/users/${selected.user_code}`, form);
      setMessage(t('userUpdated'));
      
      // Refresh the selected user data to show updated values
      const updatedUser = await api.get(`/users/${selected.user_code}`);
      setSelected(updatedUser.data);
      setForm(updatedUser.data);
      
      // Also refresh the users list if admin
      if (isAdmin) {
        const updatedUsers = await api.get('/users');
        setUsers(updatedUsers.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    }
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError(t('passwordsNoMatch'));
      return;
    }
    if (!window.confirm(t('confirmAction'))) return;
    setMessage(''); setError('');
    try {
      await api.post('/password/change', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setMessage(t('passwordChanged'));
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordChange(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    }
  };

  const handleAdminReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminResetPassword) {
      setError(t('passwordRequired'));
      return;
    }
    if (!window.confirm(`${t('resetUserPassword')} ${selected.first_name} ${selected.last_name}?`)) return;
    setMessage(''); setError('');
    try {
      await api.post(`/password/reset/${selected.user_code}`, {
        new_password: adminResetPassword
      });
      setMessage(t('passwordReset'));
      setAdminResetPassword('');
      setShowAdminReset(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      {isAdmin && (
        <div style={styles.sidebar}>
          <h3 style={styles.sideTitle}>{t('updateData')}</h3>
          
          {/* Live search similar to User Accounts */}
          <div style={styles.searchContainer}>
            <input 
              placeholder={`${t('search')} ${t('email')} ${t('or')} ${t('userCode')}...`}
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={styles.searchInput} 
            />
            {filteredUsers.length > 0 && (
              <div style={styles.dropdown}>
                {filteredUsers.map(user => (
                  <div
                    key={user.user_code}
                    onClick={() => selectUser(user)}
                    style={styles.dropdownItem}
                  >
                    <div style={styles.dropdownUser}>
                      <span style={styles.dropdownName}>{user.first_name} {user.last_name}</span>
                      <span style={styles.dropdownEmail}>{user.email}</span>
                      <span style={styles.dropdownCode}>#{user.user_code}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {selected && (
            <div style={styles.selectedUser}>
              <span style={styles.selectedUserText}>
                {selected.first_name} {selected.last_name} (#{selected.user_code})
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <h2 style={styles.title}>{t('updateData')}</h2>
        {!selected ? (
          <p style={{ color: '#94a3b8' }}>{t('selectUser')}</p>
        ) : (
          <>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.grid}>
                <div style={styles.readOnly}><label style={styles.label}>{t('userCode')}</label><div style={styles.staticVal}>#{selected.user_code}</div></div>
                <div style={styles.readOnly}><label style={styles.label}>{t('email')}</label><div style={styles.staticVal}>{selected.email}</div></div>
                <EditField label={t('firstName')} name="first_name" value={form.first_name || ''} onChange={handleChange} />
                <EditField label={t('lastName')} name="last_name" value={form.last_name || ''} onChange={handleChange} />
                <EditField label={t('wallet')} name="wallet" value={form.wallet || ''} onChange={handleChange} />
                <EditField label={t('phone')} name="phone" value={form.phone || ''} onChange={handleChange} />
                <EditField label={t('dni')} name="dni" value={form.dni || ''} onChange={handleChange} />
                {isAdmin && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={styles.label}>{t('profile')}</label>
                      <select name="profile" value={form.profile || 'user'} onChange={handleChange} style={{ ...styles.input, cursor: 'pointer' }}>
                        <option value="user">{t('user')}</option>
                        <option value="admin">{t('admin')}</option>
                      </select>
                    </div>
                    <EditField label={t('allowedAccounts')} name="allowed_accounts_count" type="number" value={String(form.allowed_accounts_count || 10)} onChange={handleChange} />
                    <EditField label={t('registeredAccounts')} name="registered_accounts_count" type="number" value={String(form.registered_accounts_count || 0)} onChange={handleChange} />
                  </>
                )}
              </div>
              {message && <p style={{ color: '#22c55e' }}>{message}</p>}
              {error && <p style={{ color: '#ef4444' }}>{error}</p>}
              <button type="submit" style={styles.btn}>{t('saveChanges')}</button>
            </form>

            {/* Password Management Section */}
            <div style={{ ...styles.form, marginTop: '1.5rem' }}>
              <h3 style={{ color: '#cbd5e1', marginBottom: '1rem', fontSize: '1rem' }}>Password Management</h3>
              
              {!isAdmin && (
                <>
                  <button 
                    onClick={() => setShowPasswordChange(!showPasswordChange)} 
                    style={styles.btnSecondary}
                  >
                    {showPasswordChange ? t('cancel') : t('changePassword')}
                  </button>

                  {showPasswordChange && (
                    <form onSubmit={handlePasswordChange} style={{ marginTop: '1rem' }}>
                      <EditField 
                        label={t('currentPassword')} 
                        name="current_password" 
                        type="password"
                        value={passwordForm.current_password} 
                        onChange={(e: any) => setPasswordForm({...passwordForm, current_password: e.target.value})} 
                      />
                      <EditField 
                        label={t('newPassword')} 
                        name="new_password" 
                        type="password"
                        value={passwordForm.new_password} 
                        onChange={(e: any) => setPasswordForm({...passwordForm, new_password: e.target.value})} 
                      />
                      <EditField 
                        label={t('confirmPassword')} 
                        name="confirm_password" 
                        type="password"
                        value={passwordForm.confirm_password} 
                        onChange={(e: any) => setPasswordForm({...passwordForm, confirm_password: e.target.value})} 
                      />
                      <button type="submit" style={styles.btn}>{t('changePassword')}</button>
                    </form>
                  )}
                </>
              )}

              {isAdmin && selected.user_code !== user?.user_code && (
                <>
                  <button 
                    onClick={() => setShowAdminReset(!showAdminReset)} 
                    style={styles.btnSecondary}
                  >
                    {showAdminReset ? t('cancel') : t('resetUserPassword')}
                  </button>

                  {showAdminReset && (
                    <form onSubmit={handleAdminReset} style={{ marginTop: '1rem' }}>
                      <EditField 
                        label={t('newPassword')} 
                        name="admin_reset_password" 
                        type="text"
                        value={adminResetPassword} 
                        onChange={(e: any) => setAdminResetPassword(e.target.value)} 
                      />
                      <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {t('sharePasswordWarning')}
                      </p>
                      <button type="submit" style={styles.btn}>{t('resetPassword')}</button>
                    </form>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EditField({ label, name, type = 'text', value, onChange }: any) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#475569', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 }}>{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' }} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700 },
  sidebar: { width: '320px', background: '#ffffff', borderRadius: '12px', padding: '1rem', flexShrink: 0, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  sideTitle: { color: '#f59e0b', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700 },
  searchContainer: { position: 'relative', marginBottom: '1rem' },
  searchInput: { 
    width: '100%', 
    padding: '0.75rem', 
    borderRadius: '8px', 
    border: '2px solid #e2e8f0', 
    background: '#ffffff', 
    color: '#0f172a', 
    fontSize: '0.9rem', 
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    borderTop: 'none',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    maxHeight: '400px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.75rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s ease'
  },
  dropdownUser: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  dropdownName: {
    fontWeight: 600,
    color: '#0f172a',
    fontSize: '0.9rem'
  },
  dropdownEmail: {
    color: '#64748b',
    fontSize: '0.8rem'
  },
  dropdownCode: {
    color: '#f59e0b',
    fontSize: '0.75rem',
    fontWeight: 600
  },
  selectedUser: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.08) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '8px',
    marginBottom: '1rem'
  },
  selectedUserText: {
    color: '#d97706',
    fontSize: '0.9rem',
    fontWeight: 600
  },
  userList: { maxHeight: '70vh', overflowY: 'auto' },
  userItem: { padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.25rem', color: '#475569', transition: 'all 0.2s ease' },
  userItemActive: { background: '#f8fafc', border: '1px solid #e2e8f0' },
  form: { background: '#ffffff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' },
  readOnly: { marginBottom: '1rem' },
  label: { display: 'block', color: '#475569', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 500 },
  staticVal: { color: '#64748b', padding: '0.65rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' },
  input: { width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box' },
  btn: { padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' },
  btnSecondary: { padding: '0.65rem 1.5rem', background: '#f1f5f9', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }
};
