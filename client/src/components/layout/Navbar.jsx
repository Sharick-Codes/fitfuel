import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Bell, Search, Flame, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      height: 'var(--navbar-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 99,
      backdropFilter: 'blur(12px)'
    }}>
      {/* Left: Greeting + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'none' /* hidden on small */ }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{greeting},</p>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name?.split(' ')[0] || 'there'} 👋</p>
        </div>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 16px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${searchFocused ? 'var(--primary)' : 'var(--border)'}`,
          boxShadow: searchFocused ? '0 0 0 3px rgba(0,212,170,0.12)' : 'none',
          width: '300px',
          transition: 'all var(--transition-fast)'
        }}>
          <Search size={17} style={{ color: searchFocused ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.2s' }} />
          <input
            type="text"
            placeholder="Search foods, exercises..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
              width: '100%',
              fontFamily: 'var(--font-body)'
            }}
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Streak Badge */}
        {user?.streak?.current > 0 && (
          <div className="streak-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            background: 'rgba(255, 107, 53, 0.12)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--secondary)',
            fontWeight: 700,
            fontSize: '0.83rem',
            border: '1px solid rgba(255,107,53,0.2)'
          }}>
            <Flame size={15} />
            {user.streak.current} day streak
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(0,212,170,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <button
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(124,92,252,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-input)'; }}
          title="Notifications"
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute',
            top: 9,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--primary)',
            border: '1.5px solid var(--bg-secondary)',
            animation: 'glowPulse 2s ease-in-out infinite'
          }} />
        </button>

        {/* User avatar mini */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '0.85rem',
          color: '#0A0E1A',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,212,170,0.25)',
          flexShrink: 0
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;




