import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

interface Account {
  account_number: number;
  user_code: number;
  first_name?: string;
  last_name?: string;
  level_1_date: string;
  level_2_date: string | null;
  level_3_date: string | null;
  level2_status: number | 'completed';
  level3_status: number | 'completed';
  complete_status: number | 'completed';
}

interface DashboardData {
  user_info: any;
  max_levels: { max_level1: number; max_level2: number; max_level3: number };
  global_max: number;
  accounts: Account[];
  balance_summary: { 
    pending_collection_amount: number; 
    collected_amount: number; 
    paid_commissions: number;
    amount_requested: number;
  };
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Load all users for search (admin only)
  useEffect(() => {
    if (isAdmin) {
      api.get('/users').then(res => setAllUsers(res.data)).catch(console.error);
    }
  }, [isAdmin]);

  // Live search filter
  useEffect(() => {
    if (!isAdmin || !searchTerm) {
      setFilteredUsers([]);
      return;
    }
    
    const filtered = allUsers.filter(u =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.user_code).includes(searchTerm)
    );
    setFilteredUsers(filtered.slice(0, 10)); // Limit to 10 results
  }, [searchTerm, allUsers, isAdmin]);

  const fetchDashboard = async (params: any = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: '50',
        ...params
      });
      const res = await api.get(`/dashboard?${queryParams}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params: any = {};
    if (selectedUser) {
      params.user_code = selectedUser.user_code;
    }
    fetchDashboard(params);
  }, [currentPage, selectedUser]);

  const selectUser = (user: any) => {
    setSelectedUser(user);
    setFilteredUsers([]);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const clearFilter = () => {
    setSelectedUser(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderStatus = (status: number | 'completed') => {
    if (status === 'completed') return <span style={{ color: '#22c55e', fontSize: '1.2rem' }}>●</span>;
    return <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{t('missing')} {status.toLocaleString()}</span>;
  };

  if (loading) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem' }}>{t('loading')}</div>;
  if (!data) return null;

  return (
    <div>
      <h2 style={styles.title}>{t('dashboard')}</h2>

      {/* Admin search and filter */}
      {isAdmin && (
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
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
          
          {selectedUser && (
            <div style={styles.selectedUser}>
              <span style={styles.selectedUserText}>
                {t('showing')} {selectedUser.first_name} {selectedUser.last_name} (#{selectedUser.user_code})
              </span>
              <button onClick={clearFilter} style={styles.clearBtn}>
                {t('showAll')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* User info */}
      {data.user_info && (
        <div style={styles.infoCard}>
          <span><strong>{t('code')}:</strong> {data.user_info.user_code}</span>
          <span><strong>{t('email')}:</strong> {data.user_info.email}</span>
          <span><strong>{t('name')}:</strong> {data.user_info.first_name} {data.user_info.last_name}</span>
        </div>
      )}

      {/* Max levels */}
      <div style={styles.levelsRow}>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel1')}</div><div style={styles.levelValue}>{data.max_levels.max_level1 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel2')}</div><div style={styles.levelValue}>{data.max_levels.max_level2 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('maxLevel3')}</div><div style={styles.levelValue}>{data.max_levels.max_level3 || 0}</div></div>
        <div style={styles.levelCard}><div style={styles.levelLabel}>{t('globalMax')}</div><div style={styles.levelValue}>{data.global_max}</div></div>
      </div>

      {/* Accounts table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>{t('accountNumber')}</th>
              <th style={styles.th}>{t('userCode')}</th>
              {isAdmin && <th style={styles.th}>{t('name')}</th>}
              <th style={styles.th}>{t('level2')}</th>
              <th style={styles.th}>{t('level3')}</th>
              <th style={styles.th}>{t('complete')}</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('noAccountsFound')}</td></tr>
            ) : data.accounts.map(acc => (
              <tr key={acc.account_number} style={styles.tr}>
                <td style={styles.td}>{acc.account_number}</td>
                <td style={styles.td}>#{acc.user_code}</td>
                {isAdmin && <td style={styles.td}>{acc.first_name} {acc.last_name}</td>}
                <td style={styles.td}>{renderStatus(acc.level2_status)}</td>
                <td style={styles.td}>{renderStatus(acc.level3_status)}</td>
                <td style={styles.td}>{renderStatus(acc.complete_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.total_pages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!data.pagination.has_prev}
            style={{
              ...styles.paginationBtn,
              ...(data.pagination.has_prev ? {} : styles.paginationBtnDisabled)
            }}
          >
            {t('previous')}
          </button>
          
          <div style={styles.paginationInfo}>
            {t('page')} {data.pagination.current_page} {t('of')} {data.pagination.total_pages}
            <span style={styles.paginationCount}>
              ({data.pagination.total_records} {t('total')})
            </span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!data.pagination.has_next}
            style={{
              ...styles.paginationBtn,
              ...(data.pagination.has_next ? {} : styles.paginationBtnDisabled)
            }}
          >
            {t('next')}
          </button>
        </div>
      )}

      {/* Balance summary */}
      <div style={styles.balanceRow}>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('pendingBalance')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.pending_collection_amount || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('amountRequested')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.amount_requested || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('totalCollected')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.collected_amount || 0)).toFixed(2)} USDC</div>
        </div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLabel}>{t('commissionsPaid')}</div>
          <div style={styles.balanceValue}>{parseFloat(String(data.balance_summary.paid_commissions || 0)).toFixed(2)} USDC</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  title: { color: '#f59e0b', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 },
  searchSection: { marginBottom: '1.5rem' },
  searchContainer: { position: 'relative', marginBottom: '1rem' },
  searchInput: { 
    width: '100%', 
    maxWidth: '400px',
    padding: '0.75rem 1rem', 
    borderRadius: '12px', 
    border: '2px solid #e2e8f0', 
    background: '#ffffff', 
    color: '#0f172a', 
    fontSize: '0.95rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxWidth: '400px',
    background: '#ffffff',
    border: '2px solid #e2e8f0',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    maxHeight: '300px',
    overflowY: 'auto'
  },
  dropdownItem: {
    padding: '0.75rem 1rem',
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
    fontSize: '0.85rem'
  },
  dropdownCode: {
    color: '#f59e0b',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  selectedUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
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
  clearBtn: {
    padding: '0.4rem 0.8rem',
    background: '#ffffff',
    color: '#f59e0b',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  infoCard: { background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '8px', display: 'flex', gap: '2rem', marginBottom: '1.5rem', color: '#475569', fontSize: '0.9rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  levelsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  levelCard: { background: '#ffffff', padding: '1rem 1.5rem', borderRadius: '8px', flex: 1, minWidth: '120px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  levelLabel: { color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 500 },
  levelValue: { color: '#f59e0b', fontSize: '1.5rem', fontWeight: 700 },
  tableWrapper: { background: '#ffffff', borderRadius: '8px', overflow: 'auto', marginBottom: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f8fafc' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: '#475569', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', color: '#0f172a', fontSize: '0.875rem' },
  pagination: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
  },
  paginationBtn: {
    padding: '0.6rem 1.2rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)',
    transition: 'all 0.2s ease'
  },
  paginationBtnDisabled: {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  paginationInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#475569',
    fontSize: '0.9rem',
    fontWeight: 600
  },
  paginationCount: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: 400
  },
  balanceRow: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  balanceCard: { background: '#ffffff', padding: '1.5rem', borderRadius: '8px', flex: 1, minWidth: '180px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' },
  balanceLabel: { color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 },
  balanceValue: { color: '#10b981', fontSize: '1.4rem', fontWeight: 700 }
};
