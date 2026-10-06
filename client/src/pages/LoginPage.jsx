import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/common/GoogleAuthButton';
import {
  Flame, ChevronRight, Eye, EyeOff, AlertCircle, CheckCircle2,
  ShieldCheck, Zap, Sparkles
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const formRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const triggerShake = () => {
    if (!formRef.current) return;
    formRef.current.classList.remove('shake');
    void formRef.current.offsetWidth;
    formRef.current.classList.add('shake');
    setTimeout(() => formRef.current?.classList.remove('shake'), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      await login(email.trim(), password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@fitfuel.com');
    setPassword('password123');
    setIsLoading(true);
    setErrorMsg('');
    try {
      await login('demo@fitfuel.com', 'password123');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 400);
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed. Please try again.');
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMsg('Please enter your email above, then click Forgot password?');
      return;
    }
    setForgotSent(true);
    setErrorMsg('');
    setTimeout(() => setForgotSent(false), 5000);
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Brand / Hero Pane */}
      <div className="auth-hero-pane">
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Logo */}
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
                PRO PERFORMANCE AI
              </span>
            </div>
          </div>

          {/* Hero Value Statement */}
          <div style={{ maxWidth: '520px' }}>
            <div className="badge-pill badge-teal" style={{ marginBottom: '18px' }}>
              <Sparkles size={13} /> Next-Gen Health Intelligence
            </div>
            <h1 style={{
              fontSize: '2.85rem',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '20px',
              letterSpacing: '-1px'
            }}>
              Smart Fueling for High Performers
            </h1>
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '36px'
            }}>
              Precision nutrition tracking, dynamic macro recalculations, and streak-driven gamification engineered to build lasting athletic momentum.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(0, 212, 170, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Science-backed Mifflin-St Jeor & TDEE Calculations
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: 'rgba(124, 92, 252, 0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-light)'
                }}>
                  <Zap size={18} />
                </div>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Visual Plate Breakdown with Interactive Macro Sliders
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Footer */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: '28px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', marginLeft: '6px' }}>
              {['💪', '⚡️', '🥗', '🎯'].map((icon, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '2px solid var(--bg-secondary)',
                    marginLeft: '-8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                ⭐ 4.9 / 5 Rating
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Trusted by 20,000+ active health enthusiasts
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Pane - Styled precisely as in Photo 1 */}
      <div className="auth-form-pane">
        <div className="auth-form-container">
          <div
            ref={formRef}
            style={{
              backgroundColor: '#111622',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              padding: '36px 32px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.45)'
            }}
          >
            {/* Header: Centered "Log in" matching Photo 1 */}
            <h1 style={{
              fontSize: '1.9rem',
              fontWeight: 700,
              color: '#FFFFFF',
              textAlign: 'center',
              marginBottom: '26px',
              letterSpacing: '-0.4px'
            }}>
              Log in
            </h1>

            {/* Error Message */}
            {errorMsg && (
              <div className="slide-up" style={{
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                color: '#f87171',
                padding: '11px 14px',
                borderRadius: '8px',
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

            {/* Forgot password feedback */}
            {forgotSent && (
              <div className="slide-up" style={{
                background: 'rgba(77, 208, 225, 0.12)',
                border: '1px solid rgba(77, 208, 225, 0.4)',
                color: '#4DD0E1',
                padding: '11px 14px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>Password reset link sent to {email}!</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="slide-up" style={{
                background: 'rgba(74, 222, 128, 0.12)',
                border: '1px solid rgba(74, 222, 128, 0.4)',
                color: '#4ade80',
                padding: '11px 14px',
                borderRadius: '8px',
                marginBottom: '18px',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={16} />
                <span>Signed in successfully! Loading dashboard...</span>
              </div>
            )}

            {/* Form matching Photo 1 */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    backgroundColor: '#171c26',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.96rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4DD0E1'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'}
                />
              </div>

              {/* Password Input with eye toggle */}
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 16px',
                      backgroundColor: '#171c26',
                      border: '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '0.96rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#4DD0E1'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                  </button>
                </div>

                {/* Forgot password link below password (Photo 1) */}
                <div style={{ textAlign: 'right', marginTop: '6px' }}>
                  <span
                    onClick={handleForgotPassword}
                    style={{
                      color: '#4DD0E1',
                      fontSize: '0.86rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Forgot password?
                  </span>
                </div>
              </div>

              {/* Continue > Button (Photo 1) */}
              <button
                type="submit"
                disabled={isLoading || success}
                style={{
                  width: '100%',
                  marginTop: '6px',
                  padding: '13px',
                  backgroundColor: '#4DD0E1',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0A0E1A',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(77, 208, 225, 0.25)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#6be2f1';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(77, 208, 225, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#4DD0E1';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(77, 208, 225, 0.25)'
                }}
              >
                {isLoading ? (
                  <span className="loader" style={{ width: 18, height: 18, borderWidth: 2 }} />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            {/* Divider: ———— or ———— (Photo 1) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '20px 0',
              gap: '14px'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.88rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.16)' }} />
            </div>

            {/* Google Sign In Button (Photo 1 & Photo 2) */}
            <div>
              <GoogleAuthButton label="Login with Google" />
            </div>

            {/* Quick Demo Athlete Autofill & Instant Login */}
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading || success}
                style={{
                  width: '100%',
                  padding: '11px',
                  backgroundColor: 'rgba(0, 212, 170, 0.1)',
                  border: '1px solid rgba(0, 212, 170, 0.4)',
                  borderRadius: '8px',
                  color: 'var(--primary)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: (isLoading || success) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.22)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(0, 212, 170, 0.1)'}
              >
                {isLoading ? (
                  <span className="loader" style={{ width: 16, height: 16, borderWidth: 2 }} />
                ) : (
                  <>
                    <Zap size={16} /> ⚡ 1-Click Instant Demo Login (demo@fitfuel.com)
                  </>
                )}
              </button>
            </div>

            {/* I don't have an account (Photo 1) */}
            <div style={{
              textAlign: 'center',
              marginTop: '22px'
            }}>
              <Link
                to="/register"
                style={{
                  color: '#4DD0E1',
                  fontSize: '0.92rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                I don&apos;t have an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
