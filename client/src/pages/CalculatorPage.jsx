import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { goalAPI, userAPI } from '../services/api';
import {
  calculateBMI,
  calculateIdealBodyWeight,
  calculateBMR,
  calculateTDEE,
  calculateWaterTarget,
  calculateCalorieTarget,
  calculateMacros,
  GOAL_TYPES,
  ACTIVITY_MULTIPLIERS
} from '../utils/calculations';
import { Calculator, Target, Info, Droplets, Scale, Activity, Flame, Sparkles, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import Confetti from '../components/common/Confetti';
import AnimatedCounter from '../components/common/AnimatedCounter';

const CalculatorPage = () => {
  const { user, stats, checkAuth } = useAuth();
  const [showConfetti, setShowConfetti] = useState(false);

  // Local state for calculations (init with user data)
  const [data, setData] = useState({
    weight: user?.weight || 70,
    height: user?.height || 175,
    age: user?.age || 25,
    gender: user?.gender || 'male',
    activityLevel: user?.activityLevel || 'moderate',
    goal: user?.goal || 'maintain',
    pace: 'moderate'
  });

  // Calculate live initial values
  const computeAll = (inputData) => {
    const bmi = calculateBMI(inputData.weight, inputData.height);
    const idealWeight = calculateIdealBodyWeight(inputData.height, inputData.gender);
    const bmr = calculateBMR(inputData.weight, inputData.height, inputData.age, inputData.gender);
    const tdee = calculateTDEE(bmr, inputData.activityLevel);
    const water = calculateWaterTarget(inputData.weight, inputData.activityLevel);
    const calorieTarget = calculateCalorieTarget(tdee, inputData.goal, inputData.pace);
    const macros = calculateMacros(calorieTarget.calories, inputData.goal, inputData.weight);

    return { bmi, idealWeight, bmr, tdee, water, calorieTarget, macros };
  };

  const [calcResults, setCalcResults] = useState(computeAll(data));
  const [isSaved, setIsSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState('');

  const handleCalculate = () => {
    const results = computeAll(data);
    setCalcResults(results);
    setIsSaved(false);
  };

  const handleSaveToProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Update active goal
      await goalAPI.create({
        goalType: data.goal === 'lose' ? 'weightLoss' : data.goal === 'gain' ? 'muscleGain' : data.goal === 'recomp' ? 'bodyRecomposition' : 'maintenance',
        currentWeight: data.weight,
        targetWeight: user?.targetWeight || (data.goal === 'lose' ? calcResults.idealWeight.idealWeight : data.weight),
        tdee: calcResults.tdee
      });

      // 2. Update user profile metrics
      if (userAPI.updateProfile) {
        await userAPI.updateProfile({
          weight: data.weight,
          height: data.height,
          age: data.age,
          gender: data.gender,
          activityLevel: data.activityLevel,
          goal: data.goal
        });
      }

      setIsSaved(true);
      setShowConfetti(true);
      setToast('Calculations synchronized with your profile & active goal! 🎯');
      setTimeout(() => setToast(''), 3500);
      if (checkAuth) checkAuth();
    } catch (err) {
      setToast('Failed to save calculations. Please try again.');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    const next = { ...data, [field]: value };
    setData(next);
    setCalcResults(computeAll(next));
    setIsSaved(false);
  };

  return (
    <div className="page-container animate-fade-in" style={{ position: 'relative' }}>
      {toast && (
        <div className="toast success slide-up" style={{ position: 'fixed', top: 90, right: 24, zIndex: 1000, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#0A0E1A', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,212,170,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          Smart Health & Nutrition Calculator <Calculator size={30} color="var(--primary)" />
        </h1>
        <p>Clinically validated formulas for BMI, Mifflin-St Jeor BMR, TDEE, Devine Ideal Weight, and optimal macro splits</p>
      </div>

      <div className="grid grid-2" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
        {/* Input Form Column */}
        <div className="glass-card stagger-1" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Scale size={20} color="var(--primary)" /> Body Parameters
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                className="input-field"
                value={data.weight}
                onChange={e => handleChange('weight', Number(e.target.value))}
                min="30"
                max="300"
                step="0.5"
              />
            </div>
            <div className="input-group">
              <label>Height (cm)</label>
              <input
                type="number"
                className="input-field"
                value={data.height}
                onChange={e => handleChange('height', Number(e.target.value))}
                min="100"
                max="250"
              />
            </div>
            <div className="input-group">
              <label>Age</label>
              <input
                type="number"
                className="input-field"
                value={data.age}
                onChange={e => handleChange('age', Number(e.target.value))}
                min="13"
                max="100"
              />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select className="input-field" value={data.gender} onChange={e => handleChange('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Physical Activity Level</label>
            <select className="input-field" value={data.activityLevel} onChange={e => handleChange('activityLevel', e.target.value)}>
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label} ({info.description})
                </option>
              ))}
            </select>
          </div>

          {/* Primary Goal Selection */}
          <div className="input-group">
            <label>Fitness & Health Goal</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              {Object.entries(GOAL_TYPES).map(([key, info]) => (
                <div
                  key={key}
                  onClick={() => handleChange('goal', key)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${data.goal === key ? info.color : 'var(--border)'}`,
                    background: data.goal === key ? `${info.color}15` : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: data.goal === key ? info.color : 'var(--text-primary)', marginBottom: '3px' }}>
                    {info.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{info.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Deficit / Surplus Pacing Selector (shown when lose/gain selected) */}
          {(data.goal === 'lose' || data.goal === 'gain') && (
            <div className="input-group">
              <label>Pacing & Aggressiveness</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                {[
                  { id: 'mild', label: 'Mild (Gentle)' },
                  { id: 'moderate', label: 'Moderate (Recommended)' },
                  { id: 'aggressive', label: 'Aggressive' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleChange('pace', p.id)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: data.pace === p.id ? 'var(--primary)' : 'var(--bg-input)',
                      color: data.pace === p.id ? '#0A0E1A' : 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn btn-secondary" onClick={handleCalculate} style={{ flex: 1 }}>
              Recalculate
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveToProfile}
              style={{ flex: 1.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              disabled={isSaving}
            >
              {isSaving ? <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <><CheckCircle2 size={16} /> Save to Profile & Goals</>}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily Targets Master Card */}
          <div className="glass-card" style={{ borderTop: `4px solid ${GOAL_TYPES[data.goal].color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame color={GOAL_TYPES[data.goal].color} /> Recommended Caloric Target
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {calcResults.calorieTarget.label}
                </p>
              </div>
              <div style={{
                padding: '8px 20px',
                background: `${GOAL_TYPES[data.goal].color}18`,
                color: GOAL_TYPES[data.goal].color,
                borderRadius: 'var(--radius-md)',
                fontWeight: 800,
                fontSize: '1.8rem',
                fontFamily: 'var(--font-heading)',
                border: `1px solid ${GOAL_TYPES[data.goal].color}40`
              }}>
                {calcResults.calorieTarget.calories} <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>kcal/day</span>
              </div>
            </div>

            {/* Macro Visual Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                <span>Protein ({calcResults.macros.proteinPercent}%)</span>
                <span>Carbs ({calcResults.macros.carbsPercent}%)</span>
                <span>Fats ({calcResults.macros.fatsPercent}%)</span>
              </div>
              <div style={{ height: '10px', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${calcResults.macros.proteinPercent}%`, background: '#00D4AA' }} title="Protein" />
                <div style={{ width: `${calcResults.macros.carbsPercent}%`, background: '#FF6B35' }} title="Carbs" />
                <div style={{ width: `${calcResults.macros.fatsPercent}%`, background: '#7C5CFC' }} title="Fats" />
              </div>
            </div>

            {/* Macro Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #00D4AA' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Protein</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{calcResults.macros.protein}g</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{calcResults.macros.proteinCalories} kcal</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #FF6B35' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Carbs</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{calcResults.macros.carbs}g</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{calcResults.macros.carbsCalories} kcal</div>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid #7C5CFC' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fats</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{calcResults.macros.fats}g</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{calcResults.macros.fatsCalories} kcal</div>
              </div>
            </div>
          </div>

          {/* 2-Column Grid for Metrics: BMI, Ideal Weight, BMR, TDEE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* BMI Card */}
            <div className="glass-card">
              <h4 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  BMI <Info size={14} color="var(--text-muted)" title="Body Mass Index = kg / m²" />
                </span>
                <span className="badge" style={{ backgroundColor: `${calcResults.bmi.color}20`, color: calcResults.bmi.color, fontWeight: 700 }}>
                  {calcResults.bmi.category}
                </span>
              </h4>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: calcResults.bmi.color, lineHeight: 1 }}>
                {calcResults.bmi.bmi}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Asian Indian Standard: <strong style={{ color: 'var(--text-primary)' }}>{calcResults.bmi.asianCategory}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Healthy weight: {calcResults.bmi.minHealthyWeight} – {calcResults.bmi.maxHealthyWeight} kg
              </div>
            </div>

            {/* Ideal Body Weight Card */}
            <div className="glass-card">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Heart size={16} color="#EC4899" /> Ideal Weight (Devine)
              </h4>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#EC4899', lineHeight: 1 }}>
                {calcResults.idealWeight.idealWeight} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>kg</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Target range: {calcResults.idealWeight.minRange} – {calcResults.idealWeight.maxRange} kg
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {data.weight > calcResults.idealWeight.idealWeight
                  ? `+${(data.weight - calcResults.idealWeight.idealWeight).toFixed(1)} kg from Devine baseline`
                  : `${(data.weight - calcResults.idealWeight.idealWeight).toFixed(1)} kg from Devine baseline`}
              </div>
            </div>

            {/* BMR Card */}
            <div className="glass-card">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Activity size={16} color="var(--accent)" /> BMR (Mifflin-St Jeor)
              </h4>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
                {calcResults.bmr} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>kcal</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Base calories burned at complete metabolic rest in 24 hours.
              </p>
            </div>

            {/* TDEE Card */}
            <div className="glass-card">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Target size={16} color="var(--primary)" /> TDEE (Maintenance)
              </h4>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)', lineHeight: 1 }}>
                {calcResults.tdee} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>kcal</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Maintenance burn with your {data.activityLevel} activity level.
              </p>
            </div>
          </div>

          {/* Water Hydration Card */}
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Droplets size={24} color="#60A5FA" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Daily Water Requirement</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Tailored to your bodyweight (35ml/kg) and activity level
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60A5FA', fontFamily: 'var(--font-heading)' }}>
                {calcResults.water.liters} <span style={{ fontSize: '1rem', fontWeight: 500 }}>Liters</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ~{calcResults.water.glasses} glasses (250ml each)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confetti Celebration Particle Canvas */}
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
    </div>
  );
};

export default CalculatorPage;

