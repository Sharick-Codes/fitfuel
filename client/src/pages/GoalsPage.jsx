import { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import { Target, TrendingDown, TrendingUp, Minus, Edit3, Calendar, Award, Compass, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import Confetti from '../components/common/Confetti';
import AnimatedCounter from '../components/common/AnimatedCounter';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const GoalsPage = () => {
  const [goalData, setGoalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [editForm, setEditForm] = useState({
    goalType: 'weightLoss',
    currentWeight: 70,
    targetWeight: 65,
    targetWeeks: 10
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchGoal();
  }, []);

  const fetchGoal = async () => {
    try {
      const { data } = await goalAPI.getActive();
      setGoalData(data);
      if (data?.goal) {
        setEditForm({
          goalType: data.goal.goalType || 'weightLoss',
          currentWeight: data.goal.currentWeight || 70,
          targetWeight: data.goal.targetWeight || 65,
          targetWeeks: 10
        });
      }
    } catch (err) {
      console.error('Failed to fetch goal', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalAPI.create({
        goalType: editForm.goalType,
        currentWeight: Number(editForm.currentWeight),
        targetWeight: Number(editForm.targetWeight),
        tdee: goalData?.goal?.dailyCalorieTarget ? goalData.goal.dailyCalorieTarget + 500 : 2200
      });
      setShowConfetti(true);
      setToast('Goal successfully updated! 🎯');
      setIsEditing(false);
      setTimeout(() => setToast(''), 3500);
      fetchGoal();
    } catch (err) {
      console.error('Failed to update goal', err);
      setToast('Failed to update goal');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  const { goal, progress } = goalData || {};

  // Milestone stages (25%, 50%, 75%, 100%)
  const currentPct = progress?.percentage || 0;
  const milestones = [
    { pct: 25, label: 'Quarterway Kickoff', desc: 'Metabolic adaptation & water loss' },
    { pct: 50, label: 'Halfway Breakthrough', desc: 'Noticeable fat loss & strength gain' },
    { pct: 75, label: 'Final Stretch', desc: 'Enhanced vascularity & muscle tone' },
    { pct: 100, label: 'Goal Realized', desc: 'Target weight achieved!' }
  ];

  // Dynamic projection data
  const startW = goal?.currentWeight || 75;
  const targetW = goal?.targetWeight || 70;
  const isLoss = goal?.goalType === 'weightLoss';
  const diff = targetW - startW;

  const chartData = {
    labels: ['Start', 'Wk 2', 'Wk 4', 'Wk 6', 'Wk 8', 'Wk 10', 'Target'],
    datasets: [
      {
        label: 'Weight Projection (kg)',
        data: [
          startW,
          Math.round((startW + diff * 0.2) * 10) / 10,
          Math.round((startW + diff * 0.4) * 10) / 10,
          Math.round((startW + diff * 0.6) * 10) / 10,
          Math.round((startW + diff * 0.8) * 10) / 10,
          Math.round((startW + diff * 0.95) * 10) / 10,
          targetW
        ],
        borderColor: '#00D4AA',
        backgroundColor: 'rgba(0, 212, 170, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#00D4AA',
        pointRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} kg`
        }
      }
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ position: 'relative' }}>
      {toast && (
        <div className="toast success slide-up" style={{ position: 'fixed', top: 90, right: 24, zIndex: 1000, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#0A0E1A', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,212,170,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Your Transformation Goal 🎯
          </h1>
          <p>The strategic blueprint defining where you are going, your milestone targets, and weekly pacing</p>
        </div>
        {goal && (
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Edit3 size={16} /> Customize Goal
          </button>
        )}
      </div>

      {/* Purpose Explanation Banner */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(124,92,252,0.06))', border: '1px solid rgba(0,212,170,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Compass size={24} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
              Why Goals Matter
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Your <strong>Goal</strong> establishes the target destination — calculating safe caloric deficits or surpluses, predicting completion dates, and pacing your weekly changes. In contrast, the <strong>Tracker</strong> records your daily reality (weight weigh-ins, meals, and water) so you know when your metabolism is responding!
            </p>
          </div>
        </div>
      </div>

      {!goal ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <Target size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h3>No Active Goal Set</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Set up your target weight and pacing right now to start your transformation journey.
          </p>
          <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '12px 28px' }}>
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Main Progress Overview & Chart */}
          <div className="grid grid-2" style={{ gap: '24px' }}>
            {/* Progress Overview */}
            <div className="glass-card stagger-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'capitalize' }}>
                    {goal.goalType === 'weightLoss' ? <TrendingDown color="var(--primary)" /> : goal.goalType === 'muscleGain' ? <TrendingUp color="var(--accent)" /> : <Minus color="var(--info)" />}
                    {goal.goalType.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <span className="badge badge-primary" style={{ fontWeight: 700 }}>Active Strategy</span>
                </div>

                {/* Start vs Current vs Target */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Starting</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                      {goal.currentWeight}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}> kg</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '0 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{progress?.percentage || 0}% Complete</span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {Math.abs(Math.round((goal.currentWeight - goal.targetWeight) * 10) / 10)} kg total goal
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: '10px' }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress?.percentage || 0))}%` }} />
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>
                      {goal.targetWeight}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}> kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Parameters Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Estimated Target Date</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', marginTop: '4px' }}>
                    {progress?.daysRemaining ? `${progress.daysRemaining} days remaining` : 'On schedule'}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>Daily Calorie Target</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>{goal.dailyCalorieTarget} kcal/day</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Protein floor: {goal.dailyProteinTarget}g
                  </div>
                </div>
              </div>
            </div>

            {/* Projection Chart */}
            <div className="glass-card stagger-2" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Weight Projection Timeline</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Safe pace: ~0.5kg / week</span>
              </div>
              <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
                <Line data={chartData} options={options} />
              </div>
            </div>
          </div>

          {/* Milestone Checkpoints Section */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--warning)" /> Milestone Stages
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {milestones.map(m => {
                const reached = currentPct >= m.pct;
                return (
                  <div
                    key={m.pct}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      background: reached ? 'rgba(0,212,170,0.08)' : 'var(--bg-input)',
                      border: `1px solid ${reached ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: reached ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {m.pct}%
                      </span>
                      {reached ? (
                        <CheckCircle2 size={18} color="var(--primary)" />
                      ) : (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} />
                      )}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: reached ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                      {m.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Customize Goal Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 9999
        }}>
          <div className="glass-card slide-up" style={{ width: '100%', maxWidth: '480px', border: '1px solid var(--border)', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Customize Your Goal 🎯</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleUpdateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label>Goal Strategy</label>
                <select
                  className="input-field"
                  value={editForm.goalType}
                  onChange={e => setEditForm({ ...editForm, goalType: e.target.value })}
                >
                  <option value="weightLoss">Weight Loss (Fat Loss Deficit)</option>
                  <option value="muscleGain">Muscle Gain (Clean Hypertrophy)</option>
                  <option value="bodyRecomposition">Body Recomposition</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="input-group">
                  <label>Current Weight (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editForm.currentWeight}
                    onChange={e => setEditForm({ ...editForm, currentWeight: e.target.value })}
                    step="0.5"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Target Weight (kg)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editForm.targetWeight}
                    onChange={e => setEditForm({ ...editForm, targetWeight: e.target.value })}
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Target Change: <strong>{Math.abs(editForm.currentWeight - editForm.targetWeight)} kg</strong> • Expected completion timeline: ~{Math.max(2, Math.ceil(Math.abs(editForm.currentWeight - editForm.targetWeight) / 0.5))} weeks
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }} disabled={saving}>
                  {saving ? <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confetti Celebration Particle Canvas */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};

export default GoalsPage;

