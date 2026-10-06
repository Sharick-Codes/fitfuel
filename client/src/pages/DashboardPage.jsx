import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mealAPI, waterAPI, wellnessAPI, goalAPI, logAPI } from '../services/api';
import { 
  Flame, Droplets, Target, Activity, ChevronRight, CheckCircle2, 
  Scale, Award, Zap, Compass, Sparkles, Calendar, UtensilsCrossed 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPage = () => {
  const { user, stats: userStats } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    meals: [],
    totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
    water: { glasses: 0, target: 8 },
    healthScore: 0,
    activeGoal: null,
    goalProgress: null,
    todayLog: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [mealsRes, waterRes, healthRes, goalRes, logRes] = await Promise.allSettled([
        mealAPI.getToday(),
        waterAPI.getToday(),
        wellnessAPI.getHealthScore(),
        goalAPI.getActive(),
        logAPI.getToday()
      ]);

      setData({
        meals: (mealsRes.status === 'fulfilled' && mealsRes.value?.data?.meals) ? mealsRes.value.data.meals : [],
        totals: (mealsRes.status === 'fulfilled' && mealsRes.value?.data?.dailyTotals) ? mealsRes.value.data.dailyTotals : { calories: 0, protein: 0, carbs: 0, fats: 0 },
        water: (waterRes.status === 'fulfilled' && waterRes.value?.data?.water) ? waterRes.value.data.water : { glasses: 0, target: 8 },
        healthScore: (healthRes.status === 'fulfilled' && typeof healthRes.value?.data?.healthScore === 'number') ? healthRes.value.data.healthScore : 0,
        activeGoal: (goalRes.status === 'fulfilled' && goalRes.value?.data?.goal) ? goalRes.value.data.goal : null,
        goalProgress: (goalRes.status === 'fulfilled' && goalRes.value?.data?.progress) ? goalRes.value.data.progress : null,
        todayLog: (logRes.status === 'fulfilled' && logRes.value?.data?.log) ? logRes.value.data.log : null
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async () => {
    try {
      const { data: resData } = await waterAPI.addGlass();
      if (resData?.water) {
        setData(prev => ({ ...prev, water: resData.water }));
      }
    } catch (err) {
      console.error('Failed to log water', err);
    }
  };

  const handleRemoveWater = async () => {
    try {
      const { data: resData } = await waterAPI.removeGlass();
      if (resData?.water) {
        setData(prev => ({ ...prev, water: resData.water }));
      }
    } catch (err) {
      console.error('Failed to log water', err);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  // Streak & Rank safe formatting (avoiding object child in React)
  const currentStreak = typeof user?.streak === 'object' ? (user?.streak?.current ?? 0) : (user?.streak ?? 0);
  const userRank = user?.level ? (String(user.level).charAt(0).toUpperCase() + String(user.level).slice(1)) : 'Beginner';

  // Calorie & Macro calculations
  const targetCalories = data.activeGoal?.dailyCalorieTarget || userStats?.calorieTarget?.calories || 2000;
  const consumedCalories = data.totals?.calories ?? 0;
  const remainingCalories = Math.max(0, targetCalories - consumedCalories);
  const caloriePercent = targetCalories > 0 ? Math.min(100, Math.round((consumedCalories / targetCalories) * 100)) : 0;

  const targetProtein = data.activeGoal?.dailyProteinTarget || userStats?.macros?.protein || 140;
  const targetCarbs = data.activeGoal?.dailyCarbsTarget || userStats?.macros?.carbs || 200;
  const targetFats = data.activeGoal?.dailyFatsTarget || userStats?.macros?.fats || 60;

  const consumedProtein = data.totals?.protein ?? 0;
  const consumedCarbs = data.totals?.carbs ?? 0;
  const consumedFats = data.totals?.fats ?? 0;

  const hasAnyMacros = consumedProtein > 0 || consumedCarbs > 0 || consumedFats > 0;

  const macroDoughnutData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fats (g)'],
    datasets: [{
      data: [
        Math.max(0, consumedProtein),
        Math.max(0, consumedCarbs),
        Math.max(0, consumedFats)
      ],
      backgroundColor: ['#00D4AA', '#FF6B35', '#7C5CFC'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  // Water calculations
  const waterGlasses = data.water?.glasses ?? 0;
  const waterTarget = data.water?.target || (user?.weight ? Math.round((user.weight * 35) / 250) : 8);
  const waterPercent = waterTarget > 0 ? Math.min(100, Math.round((waterGlasses / waterTarget) * 100)) : 0;

  // Active Goal safe variables
  const currentWeight = user?.weight || data.activeGoal?.currentWeight || 70;
  const targetWeight = data.activeGoal?.targetWeight || currentWeight;
  const weightDelta = Math.abs(currentWeight - targetWeight).toFixed(1);
  const goalProgressPercent = data.goalProgress?.percentage ?? 0;

  const goalTypeNames = {
    weightLoss: 'Weight Loss 🔥',
    muscleGain: 'Hypertrophy / Muscle Gain 💪',
    bodyRecomposition: 'Body Recomposition ⚡',
    maintenance: 'Maintenance & Vitality ⚖️'
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Hero Welcome & Gamification Banner */}
      <div className="glass-card" style={{
        marginBottom: '24px',
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08) 0%, rgba(124, 92, 252, 0.08) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Athlete'}! 👋
              </h1>
              <span className="badge badge-accent" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={13} /> {userRank}
              </span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' • '}Here is your daily metabolic summary and active progress.
            </p>
          </div>

          {/* Gamification Badges (Streak & XP) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 18px', background: 'rgba(251, 191, 36, 0.12)',
              borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.25)'
            }}>
              <Flame size={24} color="#FBBF24" />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FBBF24', lineHeight: 1 }}>
                  {currentStreak}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day Streak</div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 18px', background: 'rgba(124, 92, 252, 0.12)',
              borderRadius: '12px', border: '1px solid rgba(124, 92, 252, 0.25)'
            }}>
              <Award size={24} color="var(--accent)" />
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                  {user?.xp ?? 150} XP
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tier 1 Athlete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Goal Strategy Card */}
      {data.activeGoal && (
        <div className="glass-card" style={{
          marginBottom: '24px',
          padding: '20px 24px',
          borderLeft: '4px solid var(--primary)',
          background: 'rgba(0, 212, 170, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                  {goalTypeNames[data.activeGoal.goalType] || data.activeGoal.goalType}
                </span>
                {data.goalProgress?.daysRemaining !== null && data.goalProgress?.daysRemaining !== undefined && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {data.goalProgress.daysRemaining} days remaining
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Current: {currentWeight} kg
                </span>
                <span style={{ color: 'var(--text-muted)' }}>➔</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
                  Target: {targetWeight} kg
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ({weightDelta} kg delta)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{goalProgressPercent}%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-fill" style={{ width: `${goalProgressPercent}%` }} />
                </div>
              </div>
              <Link to="/goals" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Strategy <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Shortcuts Bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px', marginBottom: '24px'
      }}>
        <Link to="/meals" className="glass-card" style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0, 212, 170, 0.15)', color: 'var(--primary)' }}>
            <UtensilsCrossed size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Log Meal</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Breakfast, lunch, snacks</div>
          </div>
        </Link>

        <Link to="/tracker" className="glass-card" style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(124, 92, 252, 0.15)', color: 'var(--accent)' }}>
            <Scale size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Daily Weigh-in</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Update scale weight</div>
          </div>
        </Link>

        <Link to="/meals" className="glass-card" style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', color: 'var(--warning)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Indian Recipes</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>36+ curated videos</div>
          </div>
        </Link>

        <Link to="/calculator" className="glass-card" style={{
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px',
          textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s', cursor: 'pointer'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>Metabolic Lab</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>BMI, BMR, TDEE, pacing</div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Calories Card + Health Score */}
      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        
        {/* Calories Card (2 columns) */}
        <div className="glass-card" style={{ gridColumn: 'span 2', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontSize: '1.2rem' }}>
              <Flame color="var(--primary)" /> Calorie Budget & Energy Balance
            </h3>
            <Link to="/meals" style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
              + Log Food <ChevronRight size={15} />
            </Link>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div className="stat-card" style={{ flex: 1 }}>
              <span className="stat-value" style={{ color: 'var(--primary)', fontSize: '1.8rem' }}>{consumedCalories}</span>
              <span className="stat-label">Consumed (kcal)</span>
            </div>
            <div style={{ width: 1, height: 50, background: 'var(--border)' }}></div>
            <div className="stat-card" style={{ flex: 1, alignItems: 'center' }}>
              <span className="stat-value" style={{ fontSize: '1.8rem' }}>{targetCalories}</span>
              <span className="stat-label">Daily Budget (kcal)</span>
            </div>
            <div style={{ width: 1, height: 50, background: 'var(--border)' }}></div>
            <div className="stat-card" style={{ flex: 1, alignItems: 'flex-end' }}>
              <span className="stat-value" style={{ color: remainingCalories > 0 ? 'var(--accent)' : 'var(--danger)', fontSize: '1.8rem' }}>
                {remainingCalories}
              </span>
              <span className="stat-label">Remaining</span>
            </div>
          </div>

          <div className="progress-bar" style={{ height: '12px' }}>
            <div className="progress-fill" style={{ 
              width: `${caloriePercent}%`, 
              background: caloriePercent > 105 ? 'var(--danger)' : caloriePercent > 90 ? 'var(--primary)' : 'var(--accent)'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>0 kcal</span>
            <span style={{ fontWeight: 600 }}>{caloriePercent}% Budget Used</span>
            <span>{targetCalories} kcal</span>
          </div>
        </div>

        {/* Health Score Card */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', margin: 0, fontSize: '1.15rem' }}>
            <Activity color="var(--accent)" /> Metabolic Score
          </h3>
          <div style={{ position: 'relative', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0' }}>
            <svg width="130" height="130" viewBox="0 0 130 130" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="65" cy="65" r="54" fill="none" stroke="var(--bg-input)" strokeWidth="10" />
              <circle 
                cx="65" cy="65" r="54" fill="none" 
                stroke={data.healthScore >= 75 ? 'var(--primary)' : data.healthScore >= 50 ? 'var(--accent)' : 'var(--warning)'} 
                strokeWidth="10" 
                strokeDasharray="339.3" 
                strokeDashoffset={339.3 - (339.3 * Math.min(100, Math.max(0, data.healthScore))) / 100} 
                strokeLinecap="round" 
                style={{ transition: 'stroke-dashoffset 1s ease' }} 
              />
            </svg>
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {data.healthScore}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ 100</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {data.healthScore >= 75 ? '🔥 Optimal metabolic alignment' : data.healthScore >= 50 ? '⚡ Good pacing, keep logging' : 'Log meals and water to boost score'}
          </p>
        </div>

      </div>

      {/* Second Row: Macros, Hydration, Today's Meal Plan */}
      <div className="grid grid-3">
        
        {/* Macronutrient Distribution */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <Target color="var(--primary)" /> Macronutrients
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target vs Actual</span>
          </div>

          <div style={{ height: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', position: 'relative' }}>
            {!hasAnyMacros ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                Log meals to see macro breakdown
              </div>
            ) : (
              <Doughnut data={macroDoughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
            )}
          </div>

          {/* Macro Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                <span style={{ color: '#00D4AA', fontWeight: 600 }}>Protein</span>
                <span>{consumedProtein}g / {targetProtein}g</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${targetProtein > 0 ? Math.min(100, Math.round((consumedProtein / targetProtein) * 100)) : 0}%`, background: '#00D4AA' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                <span style={{ color: '#FF6B35', fontWeight: 600 }}>Carbs</span>
                <span>{consumedCarbs}g / {targetCarbs}g</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${targetCarbs > 0 ? Math.min(100, Math.round((consumedCarbs / targetCarbs) * 100)) : 0}%`, background: '#FF6B35' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '3px' }}>
                <span style={{ color: '#7C5CFC', fontWeight: 600 }}>Fats</span>
                <span>{consumedFats}g / {targetFats}g</span>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}>
                <div className="progress-fill" style={{ width: `${targetFats > 0 ? Math.min(100, Math.round((consumedFats / targetFats) * 100)) : 0}%`, background: '#7C5CFC' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Station */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <Droplets color="#60A5FA" /> Hydration
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#60A5FA', fontWeight: 600 }}>
              {waterPercent}% of Goal
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Bottle graphic */}
            <div style={{
              position: 'relative',
              width: 90,
              height: 140,
              border: '3px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '14px 14px 22px 22px',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.03)'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${waterPercent}%`,
                background: 'linear-gradient(180deg, #60A5FA 0%, #2563EB 100%)',
                transition: 'height 0.4s ease',
                borderRadius: '0 0 18px 18px'
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '1.1rem', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)'
              }}>
                {(waterGlasses * 0.25).toFixed(1)}L
              </div>
            </div>

            {/* Counter controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={handleRemoveWater}
                className="btn btn-secondary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0, fontSize: '1.1rem', fontWeight: 700 }}
                disabled={waterGlasses <= 0}
              >
                -
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  {waterGlasses} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {waterTarget}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Glasses (250ml)</div>
              </div>
              <button
                onClick={handleAddWater}
                className="btn btn-primary btn-sm"
                style={{ width: '36px', height: '36px', padding: 0, fontSize: '1.1rem', fontWeight: 700 }}
              >
                +
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Weight target: {(waterTarget * 0.25).toFixed(1)} Liters daily
            </div>
          </div>
        </div>

        {/* Today's Meals Timeline */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <CheckCircle2 color="var(--success)" /> Today's Meals
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{data.meals.length} recorded</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['breakfast', 'lunch', 'snack', 'dinner'].map(type => {
              const meal = data.meals.find(m => m.mealType === type);
              return (
                <div
                  key={type}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div>
                    <div style={{ textTransform: 'capitalize', fontWeight: 600, fontSize: '0.92rem' }}>
                      {type}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {meal ? `${meal.foods?.length || 0} items • ${meal.totalMealCalories} kcal` : 'Not recorded yet'}
                    </div>
                  </div>
                  {meal ? (
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Logged</span>
                  ) : (
                    <Link
                      to="/meals"
                      style={{ fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      + Add
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
