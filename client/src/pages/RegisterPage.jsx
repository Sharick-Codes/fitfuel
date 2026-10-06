import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Flame, User, Mail, Lock, Activity, Scale, Ruler,
  ArrowRight, ArrowLeft, Target, Eye, EyeOff, AlertCircle,
  CheckCircle2, Sparkles, ShieldCheck, Dumbbell, Zap
} from 'lucide-react';
import { calculateBMI } from '../utils/calculations';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '26',
    gender: 'male',
    height: '175',
    weight: '72',
    activityLevel: 'moderate',
    goal: 'lose'
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    if (!formRef.current) return;
    formRef.current.classList.remove('shake');
    void formRef.current.offsetWidth;
    formRef.current.classList.add('shake');
    setTimeout(() => formRef.current?.classList.remove('shake'), 600);
  };

  const handleNext = () => {
    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name');
      triggerShake();
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      triggerShake();
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      triggerShake();
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = Number(formData.age);
    const height = Number(formData.height);
    const weight = Number(formData.weight);

    if (!age || age < 13 || age > 100) {
      setErrorMsg('Please enter a valid age (13-100)');
      triggerShake();
      return;
    }
    if (!height || height < 100 || height > 250) {
      setErrorMsg('Please enter a valid height in cm (100-250)');
      triggerShake();
      return;
    }
    if (!weight || weight < 30 || weight > 300) {
      setErrorMsg('Please enter a valid weight in kg (30-300)');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age,
        gender: formData.gender,
        height,
        weight,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        targetWeight: weight
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const liveBmi = formData.height && formData.weight
    ? calculateBMI(Number(formData.weight), Number(formData.height))
    : null;

  return (
    <div className="auth-split-wrapper">
      {/* Left Brand Pane */}
      <div className="auth-hero-pane">
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 212, 170, 0.35)'
            }}>
              <Flame size={24} color="#0A0E1A" />
            </div>
            <div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.45rem',
                fontWeight: 800,
                letterSpacing: '-0.5px'
              }}>
                FIT<span style={{ color: 'var(--primary)' }}>FUEL</span>
              </span>
              <span style={{
                display: 'block',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                color: 'var(--text-muted)',
                fontWeight: 600,
                marginTop: '-2px'
              }}>
                SMART BODY ARCHITECTURE
              </span>
            </div>
          </div>

          {/* Heading */}
          <div style={{ maxWidth: '520px' }}>
            <div className="badge-pill badge-purple" style={{ marginBottom: '18px' }}>
              <Sparkles size={13} /> 100% Personalized Plan
            </div>
            <h1 style={{
              fontSize: '2.8rem',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              Your Body. <br />
              Your Goals. <br />
              <span className="gradient-text-teal">Calculated to Perfection.</span>
            </h1>
            <p style={{
              fontSize: '1.02rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '32px'
            }}>
              Join thousands achieving sustained fat loss, lean muscle definition, and unbreakable health habits.
            </p>

            {/* Benefit bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(0, 212, 170, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <CheckCircle2 size={18} />
                </div>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Instant macro breakdown for cutting, bulking, or body recomp
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(255, 107, 53, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--secondary-light)'
                }}>
                  <Dumbbell size={18} />
                </div>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Training day vs rest day calorie oscillation
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(124, 92, 252, 0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-light)'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Private, in-memory local data & fast performance
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial snippet */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '20px 24px',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          maxWidth: '480px'
        }}>
          <p style={{ fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
            &ldquo;FitFuel gave me the exact calorie and protein numbers I needed. Dropped 6kg of fat in 8 weeks while increasing my bench press.&rdquo;
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🥇</span>
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary)' }}>David M.</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Calisthenics Athlete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-form-container" style={{ maxWidth: '480px' }}>
          <div
            ref={formRef}
            className="glass-card-elevated"
            style={{ padding: '36px 32px' }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
                Create Your Account
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Step {step} of 2 — {step === 1 ? 'Account Credentials' : 'Physical Metrics'}
              </p>

              {/* Step indicator pills */}
              <div className="step-wizard-dots" style={{ marginTop: '16px', marginBottom: '8px' }}>
                <div className={`step-wizard-dot ${step === 1 ? 'active' : 'completed'}`} />
                <div className={`step-wizard-dot ${step === 2 ? 'active' : 'pending'}`} />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="slide-up" style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '18px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 1 ? (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      color: formData.name ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      className="input-pro"
                      placeholder="e.g. Jordan Hayes"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      color: formData.email ? 'var(--primary)' : 'var(--text-muted)'
                    }}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      className="input-pro"
                      placeholder="jordan@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ paddingLeft: 42 }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Create Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      color: formData.password ? 'var(--primary)' : 'var(--text-muted)',
                      pointerEvents: 'none'
                    }}>
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input-pro"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingLeft: 42, paddingRight: 44 }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ marginTop: '8px', padding: '13px', fontSize: '0.96rem', fontWeight: 700 }}
                >
                  Continue to Body Metrics <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                      Age (Years)
                    </label>
                    <input
                      type="number"
                      className="input-pro"
                      placeholder="25"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                      min="13"
                      max="100"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                      Gender
                    </label>
                    <select
                      className="input-pro"
                      value={formData.gender}
                      onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                      Height (cm)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Ruler size={16} />
                      </div>
                      <input
                        type="number"
                        className="input-pro"
                        placeholder="175"
                        value={formData.height}
                        onChange={e => setFormData({ ...formData, height: e.target.value })}
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                      Weight (kg)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Scale size={16} />
                      </div>
                      <input
                        type="number"
                        className="input-pro"
                        placeholder="70"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                        style={{ paddingLeft: 36 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live BMI Preview Card */}
                {liveBmi && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(0, 212, 170, 0.08)',
                    border: '1px solid rgba(0, 212, 170, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Calculated BMI
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: liveBmi.color }}>
                        {liveBmi.bmi}
                      </div>
                    </div>
                    <span className="badge-pill" style={{
                      background: `${liveBmi.color}22`,
                      color: liveBmi.color,
                      border: `1px solid ${liveBmi.color}55`
                    }}>
                      {liveBmi.category}
                    </span>
                  </div>
                )}

                {/* Activity Level */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                    Activity Level
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Activity size={16} />
                    </div>
                    <select
                      className="input-pro"
                      value={formData.activityLevel}
                      onChange={e => setFormData({ ...formData, activityLevel: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    >
                      <option value="sedentary">Sedentary (Desk work, little exercise)</option>
                      <option value="light">Lightly Active (1-3 workouts / week)</option>
                      <option value="moderate">Moderately Active (3-5 workouts / week)</option>
                      <option value="active">Very Active (6-7 heavy workouts / week)</option>
                      <option value="veryActive">Extremely Active (Athletic training / physical job)</option>
                    </select>
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '5px', color: 'var(--text-secondary)' }}>
                    Primary Objective
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                      <Target size={16} />
                    </div>
                    <select
                      className="input-pro"
                      value={formData.goal}
                      onChange={e => setFormData({ ...formData, goal: e.target.value })}
                      style={{ paddingLeft: 36 }}
                    >
                      <option value="lose">Weight Loss (Caloric Deficit -500 kcal)</option>
                      <option value="maintain">Maintenance (Balanced TDEE)</option>
                      <option value="gain">Lean Muscle Gain (Caloric Surplus +400 kcal)</option>
                      <option value="recomp">Body Recomposition (High Protein, Slight Deficit)</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px' }}
                    disabled={isLoading}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, padding: '12px', fontWeight: 700 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loader" style={{ width: 20, height: 20, borderWidth: 2 }} />
                    ) : (
                      <>Complete Setup <CheckCircle2 size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '24px',
              paddingTop: '18px',
              borderTop: '1px solid var(--border)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 700, color: 'var(--primary)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
