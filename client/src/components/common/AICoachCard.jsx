import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot, ArrowRight, Zap, RefreshCw, Flame, CheckCircle2 } from 'lucide-react';

const TIPS_POOL = [
  {
    title: 'Anabolic Protein Window',
    text: 'Consuming 25-35g of bioavailable protein within 2 hours of resistance training accelerates muscle protein synthesis by up to 28%.',
    action: 'Explore High-Protein Meals',
    link: '/meals'
  },
  {
    title: 'Electrolyte & Hydration Synergy',
    text: 'Mild dehydration of just 2% reduces muscular power output and cognitive focus. Add a pinch of Himalayan pink salt to your mid-day water.',
    action: 'Track Hydration',
    link: '/tracker'
  },
  {
    title: 'Metabolic Flexibility & Fiber',
    text: 'Pairing soluble fiber (oats, lentils, chia) with healthy fats blunts insulin spikes and provides steady glucose release throughout the afternoon.',
    action: 'Check Recipes',
    link: '/meals'
  },
  {
    title: 'Circadian Calorie Partitioning',
    text: 'Eating 65% of your daily carbohydrates earlier in the active day improves carbohydrate oxidation and minimizes nocturnal fat storage.',
    action: 'Review Goals Strategy',
    link: '/goals'
  }
];

const AICoachCard = ({ user, activeGoal, totals, water }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic real-time calculation
  const targetProtein = activeGoal?.dailyProteinTarget || 140;
  const consumedProtein = totals?.protein || 0;
  const proteinGap = Math.max(0, targetProtein - consumedProtein);

  const targetCal = activeGoal?.dailyCalorieTarget || 2000;
  const consumedCal = totals?.calories || 0;
  const calGap = Math.max(0, targetCal - consumedCal);

  const waterGlasses = water?.glasses || 0;
  const waterTarget = water?.target || 8;

  // Real-time custom advice
  let dynamicStatus = null;
  if (waterGlasses < Math.floor(waterTarget * 0.5)) {
    dynamicStatus = {
      badge: 'Hydration Deficit 💧',
      color: '#38BDF8',
      text: `You have logged ${waterGlasses} of ${waterTarget} glasses today. Cellular recovery and metabolic rate improve when you hydrate before 4 PM.`
    };
  } else if (proteinGap > 40) {
    dynamicStatus = {
      badge: 'Protein Synthesis Window 💪',
      color: 'var(--primary)',
      text: `You need ${proteinGap}g more protein to hit your anabolic baseline. Try Moong Dal Chilla, Paneer Bhurji, or Tawa Paneer Tikka from the Kitchen.`
    };
  } else if (calGap < 200 && calGap > 0) {
    dynamicStatus = {
      badge: 'Calorie Budget Optimized ⚖️',
      color: '#FBBF24',
      text: `You are within 200 kcal of your daily metabolic target! Enjoy a light snack like Roasted Makhana (Fox Nuts) or Masala Chaas.`
    };
  } else if (consumedCal >= targetCal) {
    dynamicStatus = {
      badge: 'Target Met! 🎉',
      color: 'var(--success)',
      text: `You have successfully fueled your metabolic engine for today. Focus on rest, sleep hygiene, and post-workout hydration!`
    };
  }

  const handleNextTip = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTipIndex(prev => (prev + 1) % TIPS_POOL.length);
      setIsRefreshing(false);
    }, 250);
  };

  const currentTip = TIPS_POOL[tipIndex];

  return (
    <div
      className="glass-card shimmer-card"
      style={{
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.12) 0%, rgba(0, 212, 170, 0.08) 100%)',
        border: '1px solid rgba(124, 92, 252, 0.3)',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(124, 92, 252, 0.15)'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124, 92, 252, 0.4)'
          }}>
            <Bot size={20} color="#0A0E1A" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              FitFuel AI Performance Coach <Sparkles size={16} color="var(--primary)" />
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time metabolic intelligence</span>
          </div>
        </div>

        <button
          onClick={handleNextTip}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem'
          }}
          title="Refresh Insight"
        >
          <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} /> New Insight
        </button>
      </div>

      {/* Dynamic Alert Banner */}
      {dynamicStatus && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.25)',
          borderRadius: 'var(--radius-md)',
          borderLeft: `4px solid ${dynamicStatus.color}`,
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: dynamicStatus.color, marginBottom: '4px' }}>
            {dynamicStatus.badge}
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {dynamicStatus.text}
          </p>
        </div>
      )}

      {/* Rotating Science Tip */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <Zap size={14} color="#FBBF24" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentTip.title}
          </span>
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          {currentTip.text}
        </p>
        <Link
          to={currentTip.link}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: 'var(--primary)',
            fontWeight: 700
          }}
        >
          {currentTip.action} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default AICoachCard;
