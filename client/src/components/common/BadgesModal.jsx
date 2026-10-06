import { useState, useEffect } from 'react';
import { gamificationAPI } from '../../services/api';
import { Award, Trophy, Star, ShieldCheck, Flame, Droplets, Utensils, X, CheckCircle2, Lock } from 'lucide-react';

const FALLBACK_BADGES = [
  { id: 'streak_3', name: 'Ignition Flame', description: 'Log meals for 3 consecutive days', icon: '🔥', category: 'streak', unlocked: true, xp: 100 },
  { id: 'streak_7', name: 'Iron Discipline', description: 'Maintain a 7-day logging streak', icon: '⚡', category: 'streak', unlocked: true, xp: 250 },
  { id: 'water_master', name: 'Hydration Hero', description: 'Reach 8 glasses of water in a single day', icon: '💧', category: 'wellness', unlocked: true, xp: 150 },
  { id: 'protein_king', name: 'Anabolic Surge', description: 'Hit your daily protein target 5 times', icon: '🥩', category: 'nutrition', unlocked: true, xp: 300 },
  { id: 'chef_explorer', name: 'Indian Masterchef', description: 'Explore and log 10 authentic Indian recipes', icon: '🍛', category: 'nutrition', unlocked: false, xp: 200 },
  { id: 'century_log', name: 'Centurion Club', description: 'Complete 100 total fitness and meal logs', icon: '🏆', category: 'milestone', unlocked: false, xp: 500 }
];

const BadgesModal = ({ isOpen, onClose, onCelebrate }) => {
  const [badges, setBadges] = useState(FALLBACK_BADGES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBadges();
    }
  }, [isOpen]);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await gamificationAPI.getBadges();
      if (res.data?.badges && res.data.badges.length > 0) {
        setBadges(res.data.badges);
      }
    } catch (err) {
      // Use fallback badges
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      zIndex: 10000
    }}>
      <div
        className="glass-card modal-spring"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)'
            }}>
              <Trophy size={24} color="#0A0E1A" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                Achievements & Trophies 🏆
              </h2>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                {unlockedCount} of {badges.length} Unlocked • Earn XP to level up
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-input)', border: '1px solid var(--border)',
              color: 'var(--text-muted)', width: 34, height: 34, borderRadius: '8px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Badges Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {badges.map((b, idx) => (
            <div
              key={b.id || idx}
              onClick={() => {
                if (b.unlocked && onCelebrate) onCelebrate();
              }}
              className={b.unlocked ? 'shimmer-card' : ''}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: b.unlocked ? 'rgba(251, 191, 36, 0.08)' : 'var(--bg-input)',
                border: b.unlocked ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid var(--border)',
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                cursor: b.unlocked ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                opacity: b.unlocked ? 1 : 0.6
              }}
            >
              <div style={{
                fontSize: '2rem',
                width: 52,
                height: 52,
                borderRadius: '12px',
                background: b.unlocked ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }} className={b.unlocked ? 'trophy-float' : ''}>
                {b.icon || '🏅'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: b.unlocked ? '#FBBF24' : 'var(--text-primary)' }}>
                    {b.name}
                  </h4>
                  {b.unlocked ? (
                    <span style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> +{b.xp || 100} XP
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={11} /> Locked
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          💡 Complete daily workouts, maintain hydration, and log authentic recipes to unlock new trophies!
        </div>
      </div>
    </div>
  );
};

export default BadgesModal;
