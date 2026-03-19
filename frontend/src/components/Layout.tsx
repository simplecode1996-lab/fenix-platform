import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, Users, UserPlus, Settings, CreditCard, 
  Wallet, DollarSign, TrendingUp, LogOut, Menu, X, ChevronRight, Languages 
} from 'lucide-react';

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const adminMenu = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('createUsers'), path: '/create-user', icon: UserPlus },
    { label: t('updateData'), path: '/update-data', icon: Settings },
    { label: t('userAccounts'), path: '/accounts', icon: Users },
    { label: t('payments'), path: '/payments', icon: DollarSign },
    { label: t('generateRights'), path: '/generate-rights', icon: TrendingUp },
  ];

  const userMenu = [
    { label: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('updateData'), path: '/update-data', icon: Settings },
    { label: t('requestPayment'), path: '/request-payment', icon: CreditCard },
    { label: t('fenixWallets'), path: '/wallets', icon: Wallet },
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.wrapper}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarClosed) }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>
            <img src="/Logo Fenix-03.png" alt="Fenix Logo" style={styles.logoIcon} />
          </div>
        </div>

        <nav style={styles.nav}>
          {menu.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {})
                }}
                className="nav-item"
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span style={styles.navLabel}>{item.label}</span>
                    {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            {sidebarOpen && (
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user?.first_name} {user?.last_name}</div>
                <div style={styles.userRole}>{user?.profile}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title={t('logout')}>
            <LogOut size={20} />
            {sidebarOpen && <span>{t('logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerRight}>
            {/* Language Switcher */}
            <div style={styles.langSwitcher}>
              <Languages size={18} style={{ color: '#94a3b8' }} />
              <button
                onClick={() => setLanguage('en')}
                style={{
                  ...styles.langBtn,
                  ...(language === 'en' ? styles.langBtnActive : {})
                }}
              >
                EN
              </button>
              <span style={{ color: '#334155' }}>|</span>
              <button
                onClick={() => setLanguage('es')}
                style={{
                  ...styles.langBtn,
                  ...(language === 'es' ? styles.langBtnActive : {})
                }}
              >
                ES
              </button>
            </div>
            
            <div style={styles.badge}>
              {isAdmin ? t('administrator') : t('user')}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={styles.content} className="fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc',
  },
  sidebar: {
    width: '280px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.3s ease',
    position: 'relative',
    zIndex: 10,
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
  },
  sidebarClosed: {
    width: '80px',
  },
  sidebarHeader: {
    height: '70px',
    padding: '0 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
  },
  logoIcon: {
    width: '120px',
    height: 'auto',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '1px',
  },
  nav: {
    flex: 1,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.95rem',
    fontWeight: 500,
    textAlign: 'left',
  },
  navItemActive: {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.08) 100%)',
    color: '#f59e0b',
    fontWeight: 600,
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.15)',
  },
  navLabel: {
    flex: 1,
  },
  sidebarFooter: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    color: '#ffffff',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  header: {
    height: '70px',
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    gap: '1rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  headerRight: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    height: '100%',
  },
  badge: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.08) 100%)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    borderRadius: '20px',
    color: '#d97706',
    fontSize: '0.85rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto',
  },
  langSwitcher: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
  },
  langBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  langBtnActive: {
    color: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
  },
};
