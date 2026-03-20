import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setForgotMessage('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || t('errorOccurred');
      setError(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('emailRequired'));
      return;
    }
    setError(''); setForgotMessage('');
    try {
      const res = await api.post('/password/forgot', { email });
      setForgotMessage(res.data.note || t('requestReset'));
      setShowForgot(false);
    } catch (err: any) {
      setError(t('errorOccurred'));
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Effects */}
      <div style={styles.bgGradient1}></div>
      <div style={styles.bgGradient2}></div>
      <div style={styles.bgGrid}></div>

      {/* Login Card */}
      <div style={styles.card} className="fade-in">
        {/* Logo */}
        <div style={styles.logoSection}>
          <img src="/Logo Fenix-04.png" alt="Fenix Logo" style={styles.logoIcon} />
          <h1 style={styles.title}>FENIX PLATFORM</h1>
          <p style={styles.subtitle}>
            {showForgot ? t('resetPassword') : t('welcomeBack')}
          </p>
        </div>

        {!showForgot ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Lock size={16} />
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div style={styles.alertError}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {forgotMessage && (
              <div style={styles.alertSuccess}>
                <CheckCircle size={18} />
                {forgotMessage}
              </div>
            )}

            <button type="submit" style={styles.submitBtn} disabled={loading} className="btn-primary">
              {loading ? (
                <span className="loading"></span>
              ) : (
                <>
                  {t('login')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button 
              type="button" 
              onClick={() => setShowForgot(true)} 
              style={styles.forgotBtn}
            >
              {t('forgotPassword')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <Mail size={16} />
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div style={styles.infoBox}>
              <AlertCircle size={18} />
              <p>{t('requestReset')}</p>
            </div>

            {error && (
              <div style={styles.alertError}>
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button type="submit" style={styles.submitBtn} className="btn-primary">
              {t('requestReset')}
              <ArrowRight size={18} />
            </button>

            <button 
              type="button" 
              onClick={() => setShowForgot(false)} 
              style={styles.forgotBtn}
            >
              {t('backToLogin')}
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerDot}></div>
          <span>{t('secureLogin')}</span>
          <div style={styles.footerDot}></div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  bgGradient2: {
    position: 'absolute',
    bottom: '-20%',
    left: '-10%',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
  },
  card: {
    position: 'relative',
    background: '#ffffff',
    backdropFilter: 'blur(20px)',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 100px rgba(245, 158, 11, 0.05)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '2.5rem',
  },
  logoIcon: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    letterSpacing: '2px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: 500,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#475569',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  input: {
    padding: '1rem 1.25rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#0f172a',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
  },
  forgotBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textAlign: 'center',
    padding: '0.5rem',
    transition: 'color 0.2s ease',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '0.9rem',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '12px',
    color: '#10b981',
    fontSize: '0.9rem',
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    background: 'rgba(59, 130, 246, 0.08)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '12px',
    color: '#3b82f6',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    color: '#94a3b8',
    fontSize: '0.85rem',
  },
  footerDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#94a3b8',
  },
};
