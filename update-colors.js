// Script to update all page colors to bright theme
// This is a reference for the color changes needed

const brightColors = {
  // Backgrounds
  cardBg: '#ffffff',
  secondaryBg: '#f8fafc',
  tertiaryBg: '#f1f5f9',
  
  // Text
  primaryText: '#0f172a',
  secondaryText: '#475569',
  mutedText: '#64748b',
  lightText: '#94a3b8',
  
  // Borders
  border: '#e2e8f0',
  borderMedium: '#cbd5e1',
  
  // Inputs
  inputBg: '#ffffff',
  inputBorder: '#e2e8f0',
  
  // Buttons
  primaryBtn: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  primaryBtnText: '#ffffff',
  secondaryBtn: '#f1f5f9',
  secondaryBtnText: '#0f172a',
  secondaryBtnBorder: '#e2e8f0',
  
  // Tables
  tableHeaderBg: '#f8fafc',
  tableBorder: '#e2e8f0',
  
  // Shadows
  shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  shadowMd: '0 4px 12px rgba(0, 0, 0, 0.12)',
};

// Replace patterns:
// background: '#1e293b' -> background: '#ffffff'
// background: '#0f172a' -> background: '#f8fafc' or '#f1f5f9'
// background: '#334155' -> background: '#f1f5f9'
// color: '#cbd5e1' -> color: '#475569'
// color: '#f1f5f9' -> color: '#0f172a'
// color: '#94a3b8' -> color: '#64748b'
// border: '1px solid #334155' -> border: '1px solid #e2e8f0'
// Add: boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' to cards
