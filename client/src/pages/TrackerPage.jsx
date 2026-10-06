import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { logAPI } from '../services/api';
import { 
  Activity, Scale, Calendar, PlusCircle, CheckCircle2, 
  TrendingUp, TrendingDown, Info, Droplets, Sparkles, X, Heart, Smile
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

const TrackerPage = () => {
  const { user, stats: userStats } = useAuth();
  const [timeframe, setTimeframe] = useState(7); // 7 or 30 days
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);

  // Quick Log Form State
  const [logForm, setLogForm] = useState({
    weight: '',
    caloriesConsumed: '',
    caloriesBurned: '',
    waterIntake: 8,
    mood: 'good',
    notes: ''
  });

  useEffect(() => {
    fetchStats(timeframe);
  }, [timeframe]);

  // Prepopulate today's values if available
  useEffect(() => {
    if (user?.weight) {
      setLogForm(prev => ({ ...prev, weight: user.weight }));
    }
    fetchTodayLog();
  }, [user]);

  const fetchTodayLog = async () => {
    try {
      const { data } = await logAPI.getToday();
      if (data?.log) {
        setLogForm({
          weight: data.log.weight || user?.weight || '',
          caloriesConsumed: data.log.caloriesConsumed || '',
          caloriesBurned: data.log.caloriesBurned || '',
          waterIntake: data.log.waterIntake || 8,
          mood: data.log.mood || 'good',
          notes: data.log.notes || ''
        });
      }
    } catch (err) {
      // no today log yet
    }
  };

  const fetchStats = async (days) => {
    setLoading(true);
    try {
      const { data } = await logAPI.getStats(days);
      setStatsData(data);
    } catch (err) {
      console.error('Failed to fetch tracker stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogSubmit = async (e) => {
    e.preventDefault();
    setSavingLog(true);
    try {
      const payload = {
        weight: logForm.weight ? parseFloat(logForm.weight) : undefined,
        caloriesConsumed: logForm.caloriesConsumed ? parseInt(logForm.caloriesConsumed, 10) : 0,
        caloriesBurned: logForm.caloriesBurned ? parseInt(logForm.caloriesBurned, 10) : 0,
        waterIntake: parseInt(logForm.waterIntake, 10) || 0,
        mood: logForm.mood,
        notes: logForm.notes
      };

      await logAPI.create(payload);
      setLogSuccess(true);
      await fetchStats(timeframe);
      setTimeout(() => {
        setLogSuccess(false);
        setShowLogModal(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to submit log', err);
    } finally {
      setSavingLog(false);
    }
  };

  const { stats, logs = [] } = statsData || { stats: null, logs: [] };
  const targetCalories = userStats?.calorieTarget?.calories || 2000;

  // Chart data sorted chronologically (oldest to newest)
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Date labels
  const dateLabels = sortedLogs.map(l => 
    new Date(l.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      ...(timeframe === 7 ? { weekday: 'short' } : {}) 
    })
  );

  // Calorie Bar Chart Data
  const calorieChartData = {
    labels: dateLabels.length > 0 ? dateLabels : ['No data yet'],
    datasets: [
      {
        type: 'bar',
        label: 'Calories Consumed',
        data: sortedLogs.map(l => l.caloriesConsumed || 0),
        backgroundColor: sortedLogs.map(l => 
          l.caloriesConsumed > targetCalories * 1.1 
            ? 'rgba(239, 68, 68, 0.85)' 
            : l.caloriesConsumed < targetCalories * 0.85
            ? 'rgba(251, 191, 36, 0.85)'
            : 'rgba(0, 212, 170, 0.85)'
        ),
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const calorieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          afterLabel: (context) => `Target: ${targetCalories} kcal`
        }
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.06)' }, 
        beginAtZero: true,
        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
      }
    }
  };

  // Weight Trend Line Chart Data
  const weightLogs = sortedLogs.filter(l => l.weight && l.weight > 0);
  const weightLabels = weightLogs.map(l => 
    new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const weightValues = weightLogs.map(l => l.weight);

  const weightChartData = {
    labels: weightLabels.length > 0 ? weightLabels : ['No weigh-ins yet'],
    datasets: [
      {
        label: 'Body Weight (kg)',
        data: weightValues.length > 0 ? weightValues : [user?.weight || 70],
        borderColor: '#7C5CFC',
        backgroundColor: 'rgba(124, 92, 252, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#7C5CFC',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const weightChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.6)' }
      }
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* Purpose Banner: Goals vs Tracker */}
      <div className="glass-card" style={{
        marginBottom: '28px',
        padding: '24px 28px',
        borderLeft: '4px solid var(--accent)',
        background: 'linear-gradient(135deg, rgba(124, 92, 252, 0.08) 0%, rgba(0, 212, 170, 0.04) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 550px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={13} /> The Tactical Feedback Loop
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily Reality vs Intention</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 8px 0' }}>
              Why We Track: Closing the Gap Between Plan & Metabolic Reality
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              While <strong>Goals</strong> set your strategic destination, the <strong>Tracker</strong> captures daily physiological feedback. 
              Small day-to-day fluctuations in water, sodium, and glycogen can mask true tissue loss or gain. 
              By recording consistent weigh-ins, calories, and hydration, FitFuel surfaces your true weekly trend line and metabolic adaptation.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowLogModal(true)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', fontWeight: 600 }}
            >
              <PlusCircle size={18} /> Quick Log Today
            </button>
          </div>
        </div>
      </div>

      {/* Page Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Progress & Compliance Tracker 📈</h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Review your body weight trends, caloric adherence, and logging streaks
          </p>
        </div>

        {/* Timeframe Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-input)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setTimeframe(7)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              background: timeframe === 7 ? 'var(--accent)' : 'transparent',
              color: timeframe === 7 ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeframe(30)}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.88rem',
              background: timeframe === 30 ? 'var(--accent)' : 'transparent',
              color: timeframe === 30 ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-4" style={{ marginBottom: '28px' }}>
        {/* Avg Calorie Card */}
        <div className="glass-card stat-card" style={{ padding: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(0, 212, 170, 0.15)', color: 'var(--primary)' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-label">Avg Daily Calories</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>
              {stats?.calorieAvg || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kcal</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Target: {targetCalories} kcal
            </div>
          </div>
        </div>

        {/* Weight Change Card */}
        <div className="glass-card stat-card" style={{ padding: '20px' }}>
          <div className="stat-icon" style={{ 
            background: (stats?.weightTrend?.change || 0) <= 0 ? 'rgba(0, 212, 170, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
            color: (stats?.weightTrend?.change || 0) <= 0 ? 'var(--primary)' : 'var(--warning)' 
          }}>
            <Scale size={22} />
          </div>
          <div>
            <div className="stat-label">Weight Delta ({timeframe}d)</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>
              {stats?.weightTrend ? (
                <>
                  {stats.weightTrend.change > 0 ? `+${stats.weightTrend.change}` : stats.weightTrend.change}
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}> kg</span>
                </>
              ) : (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Need ≥2 logs</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {stats?.weightTrend ? `${stats.weightTrend.start}kg → ${stats.weightTrend.current}kg` : 'Log daily weigh-ins'}
            </div>
          </div>
        </div>

        {/* Consistency / Log Count */}
        <div className="glass-card stat-card" style={{ padding: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(124, 92, 252, 0.15)', color: 'var(--accent)' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-label">Tracking Consistency</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>
              {stats?.totalLogs || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {timeframe}d</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {Math.round(((stats?.totalLogs || 0) / timeframe) * 100)}% adherence rate
            </div>
          </div>
        </div>

        {/* Average Health Score */}
        <div className="glass-card stat-card" style={{ padding: '20px' }}>
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
            <Heart size={22} />
          </div>
          <div>
            <div className="stat-label">Avg Health Score</div>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>
              {stats?.avgHealthScore || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Nutrition + Water + Balance
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-2" style={{ marginBottom: '28px', gap: '24px' }}>
        
        {/* Calorie Intake Bar Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Daily Calorie Intake</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Green: On Target • Yellow: Deficit • Red: Over Limit
              </p>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>Target: {targetCalories} kcal</span>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading chart...
              </div>
            ) : sortedLogs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <p>No calorie logs found for this timeframe.</p>
                <button onClick={() => setShowLogModal(true)} className="btn btn-sm btn-primary">Log First Entry</button>
              </div>
            ) : (
              <Bar data={calorieChartData} options={calorieChartOptions} />
            )}
          </div>
        </div>

        {/* Weight Progression Line Chart */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Body Weight Dynamics (kg)</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Continuous smoothed curve of daily weigh-in logs
              </p>
            </div>
            {stats?.weightTrend && (
              <span className={`badge ${stats.weightTrend.change <= 0 ? 'badge-primary' : 'badge-warning'}`} style={{ fontSize: '0.8rem' }}>
                {stats.weightTrend.change > 0 ? `+${stats.weightTrend.change} kg` : `${stats.weightTrend.change} kg`}
              </span>
            )}
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading chart...
              </div>
            ) : weightLogs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                <p>No weigh-in data logged in this timeframe.</p>
                <button onClick={() => setShowLogModal(true)} className="btn btn-sm btn-accent">Record Weight Now</button>
              </div>
            ) : (
              <Line data={weightChartData} options={weightChartOptions} />
            )}
          </div>
        </div>

      </div>

      {/* Detailed Log History Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Detailed Log History</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Complete record of calories, scale weight, hydration, and bio-feedback
            </p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="btn btn-sm btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} /> Add / Update Entry
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>No tracking entries recorded yet for this period.</p>
            <p style={{ margin: '6px 0 16px 0', fontSize: '0.85rem' }}>Start building your transformation dataset today!</p>
            <button onClick={() => setShowLogModal(true)} className="btn btn-primary btn-sm">
              Log Today's Entry
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Weight</th>
                  <th style={{ padding: '12px 16px' }}>Intake</th>
                  <th style={{ padding: '12px 16px' }}>Burned</th>
                  <th style={{ padding: '12px 16px' }}>Water</th>
                  <th style={{ padding: '12px 16px' }}>Mood</th>
                  <th style={{ padding: '12px 16px' }}>Health Score</th>
                  <th style={{ padding: '12px 16px' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isOver = log.caloriesConsumed > targetCalories * 1.1;
                  const isUnder = log.caloriesConsumed > 0 && log.caloriesConsumed < targetCalories * 0.85;

                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        {log.weight ? (
                          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{log.weight} kg</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontWeight: 700,
                          color: isOver ? 'var(--danger)' : isUnder ? 'var(--warning)' : 'var(--primary)'
                        }}>
                          {log.caloriesConsumed || 0} kcal
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {log.caloriesBurned ? `${log.caloriesBurned} kcal` : '0'}
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#60A5FA' }}>
                          <Droplets size={14} /> {log.waterIntake || 0} gl
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${
                          log.mood === 'great' ? 'badge-primary' : 
                          log.mood === 'good' ? 'badge-accent' : 
                          log.mood === 'bad' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                          {log.mood || 'okay'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{log.healthScore || 0}</span>
                          <div style={{ width: 45, height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${log.healthScore || 0}%`, 
                              height: '100%', 
                              background: (log.healthScore || 0) > 70 ? 'var(--primary)' : 'var(--warning)' 
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Log Modal */}
      {showLogModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animate-scale-up" style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            position: 'relative',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <button
              onClick={() => setShowLogModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0, 212, 170, 0.15)', color: 'var(--primary)' }}>
                <PlusCircle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Quick Log Today</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {logSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
                <h4>Log Saved Successfully!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Your metrics have been recorded and stats recalculated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleQuickLogSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Weight & Water Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                      <Scale size={15} color="var(--accent)" /> Body Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 72.5"
                      value={logForm.weight}
                      onChange={(e) => setLogForm(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                      <Droplets size={15} color="#60A5FA" /> Water (Glasses)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setLogForm(prev => ({ ...prev, waterIntake: Math.max(0, parseInt(prev.waterIntake || 0) - 1) }))}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '8px 14px' }}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', fontWeight: 700 }}
                        value={logForm.waterIntake}
                        onChange={(e) => setLogForm(prev => ({ ...prev, waterIntake: e.target.value }))}
                      />
                      <button
                        type="button"
                        onClick={() => setLogForm(prev => ({ ...prev, waterIntake: parseInt(prev.waterIntake || 0) + 1 }))}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '8px 14px' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calories Consumed & Burned */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                      <Activity size={15} color="var(--primary)" /> Calories Eaten (kcal)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={`Target: ${targetCalories}`}
                      value={logForm.caloriesConsumed}
                      onChange={(e) => setLogForm(prev => ({ ...prev, caloriesConsumed: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                      <TrendingDown size={15} color="var(--warning)" /> Burned Active (kcal)
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 350"
                      value={logForm.caloriesBurned}
                      onChange={(e) => setLogForm(prev => ({ ...prev, caloriesBurned: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Mood Selection */}
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    <Smile size={15} color="var(--accent)" /> How are you feeling today?
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'great', label: '🤩 Great' },
                      { id: 'good', label: '😊 Good' },
                      { id: 'okay', label: '😐 Okay' },
                      { id: 'bad', label: '😓 Tired' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLogForm(prev => ({ ...prev, mood: item.id }))}
                        style={{
                          padding: '10px 6px',
                          borderRadius: '8px',
                          border: logForm.mood === item.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: logForm.mood === item.id ? 'rgba(124, 92, 252, 0.2)' : 'var(--bg-input)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '6px' }}>
                    Daily Notes & Observations
                  </label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Hit 120g protein, went for a 45-min evening walk..."
                    value={logForm.notes}
                    onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={savingLog}
                  >
                    {savingLog ? 'Saving...' : 'Record Entry'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default TrackerPage;
