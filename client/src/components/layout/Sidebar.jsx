import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Calculator, Utensils, Target, Activity, Flame, LogOut, Trophy } from 'lucide-react';

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/meals', icon: Utensils, label: 'Meals' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/tracker', icon: Activity, label: 'Tracker' },
];

const LEVEL_COLORS = {
  beginner: '#00D4AA',
  intermediate: '#FF6B35',
  advanced: '#7C5CFC',
  elite: '#FBBF24',
  legend: '#F472B6'
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const levelColor = LEVEL_COLORS[user?.level] || '#00D4AA';

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      transition: 'all var(--transition-normal)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,212,170,0.25)',
          flexShrink: 0
        }}>
          <Flame size={20} color="#0A0E1A" />
        </div>
        <div>
          <h3 style={{
            fontSize: '1.15rem', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            FitFuel
          </h3>
          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Calorie Tracker</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(0, 212, 170, 0.1)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.92rem',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                border: isActive ? '1px solid rgba(0,212,170,0.15)' : '1px solid transparent'
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '20%',
                  bottom: '20%',
                  width: 3,
                  borderRadius: '0 4px 4px 0',
                  background: 'linear-gradient(180deg, var(--primary), var(--accent))',
                  boxShadow: '0 0 8px rgba(0,212,170,0.5)'
                }} />
              )}
              <item.icon size={19} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '8px',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-full)',
            background: `linear-gradient(135deg, ${levelColor}, var(--accent))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.9rem',
            color: '#0A0E1A',
            flexShrink: 0,
            boxShadow: `0 3px 10px ${levelColor}40`
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <p style={{
              fontSize: '0.85rem', fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              color: 'var(--text-primary)'
            }}>{user?.name || 'User'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{
                fontSize: '0.65rem', color: 'white', fontWeight: 700,
                background: `linear-gradient(135deg, ${levelColor}, var(--accent))`,
                padding: '1px 7px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>{user?.level || 'beginner'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <Trophy size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                {user?.xp || 0} XP
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)';
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.background = 'rgba(248,113,113,0.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;


