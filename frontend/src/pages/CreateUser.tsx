import { useState, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
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
      setForm({ email: '', first_name: '', last_name: '', profile: 'user', wallet: '', phone: '', dni: '', allowed_accounts_count: 10, registered_accounts_count: 0, password: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
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
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.75rem' },
  form: { background: '#ffffff', padding: '2.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
  label: { display: 'block', color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '0.875rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', boxSizing: 'border-box', transition: 'all 0.2s' },
  success: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid rgba(16, 185, 129, 0.2)' },
  error: { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.5rem', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' },
  btn: { width: '100%', padding: '1rem 2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', transition: 'all 0.2s', marginTop: '1rem' }
};
