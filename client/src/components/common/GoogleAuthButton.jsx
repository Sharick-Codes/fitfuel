import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User as UserIcon, X, ChevronDown, Flame, Check } from 'lucide-react';

export const GoogleIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleAuthButton = ({ label = "Login with Google", onSuccess }) => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Primary user account shown in the Google Chooser (matches photo 2)
  const primaryAccount = {
    name: 'Sharick Ahmed A',
    email: 'a.sharickahmed@gmail.com',
    initials: 'SA',
    googleId: 'g_sharickahmed'
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize native Google Identity Services if a client ID is provided
  useEffect(() => {
    if (window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setLoading(true);
              try {
                await googleLogin({ credential: response.credential });
                if (onSuccess) onSuccess();
                else navigate('/dashboard');
              } catch (err) {
                setError(err.message || 'Google sign-in failed');
              } finally {
                setLoading(false);
              }
            }
          }
        });
      } catch (e) {
        console.warn('GIS init error:', e);
      }
    }
  }, [clientId, googleLogin, navigate, onSuccess]);

  const handleTriggerLogin = () => {
    setError('');
    // If native GIS with Client ID is configured, trigger prompt
    if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt();
    }
    // Always open the Google Account Chooser matching Photo 2
    setShowModal(true);
  };

  const handleSelectAccount = async (account) => {
    setLoading(true);
    setError('');
    try {
      await googleLogin({
        email: account.email,
        name: account.name,
        googleId: account.googleId || `g_${Date.now()}`,
        profileImage: account.profileImage || ''
      });
      setShowModal(false);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail) return;
    handleSelectAccount({
      email: customEmail.trim(),
      name: customName.trim() || customEmail.split('@')[0],
      googleId: `g_${Date.now()}`
    });
  };

  return (
    <>
      {/* Photo 1: Login with Google Button */}
      <button
        type="button"
        onClick={handleTriggerLogin}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '12px 16px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          borderRadius: '8px',
          color: '#FFFFFF',
          fontSize: '0.96rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxSizing: 'border-box'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          e.currentTarget.style.borderColor = '#FFFFFF';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.7)';
        }}
      >
        <GoogleIcon size={20} />
        <span>{loading ? 'Signing in...' : label}</span>
      </button>

      {/* Photo 2: Google Identity Account Chooser Popup */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: '#131314',
              borderRadius: '24px',
              border: '1px solid #303134',
              color: '#e8eaed',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top Bar: Google G logo + Sign in with Google */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GoogleIcon size={18} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#e8eaed' }}>
                  Sign in with Google
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9aa0a6',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '50%'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message if any */}
            {error && (
              <div style={{
                margin: '16px 28px 0',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
                color: '#f87171',
                fontSize: '0.86rem'
              }}>
                {error}
              </div>
            )}

            {/* Main Content: Split into Left Brand & Right Accounts (Exactly like Photo 2) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.3fr)',
              padding: '36px 36px 28px',
              gap: '40px'
            }} className="google-chooser-grid">
              
              {/* Left Column: App Brand & Heading */}
              <div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#00D4AA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                  boxShadow: '0 8px 24px rgba(0, 212, 170, 0.3)'
                }}>
                  <Flame size={26} color="#0A0E1A" />
                </div>

                <h2 style={{
                  fontSize: '1.9rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: '0 0 10px 0',
                  lineHeight: 1.25,
                  letterSpacing: '-0.5px'
                }}>
                  Choose an account
                </h2>

                <p style={{
                  fontSize: '1rem',
                  color: '#e8eaed',
                  margin: 0
                }}>
                  to continue to <span style={{ color: '#00D4AA', fontWeight: 600 }}>FitFuel</span>
                </p>
              </div>

              {/* Right Column: Account list & Actions */}
              <div>
                {/* Account Row: Sharick Ahmed A (Photo 2) */}
                <div
                  onClick={() => handleSelectAccount(primaryAccount)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3a5f, #0e2038)',
                    border: '1.5px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#ffffff',
                    flexShrink: 0
                  }}>
                    {primaryAccount.initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '0.96rem',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>
                      {primaryAccount.name}
                    </div>
                    <div style={{
                      fontSize: '0.84rem',
                      color: '#9aa0a6',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {primaryAccount.email}
                    </div>
                  </div>
                </div>

                <div style={{
                  height: '1px',
                  backgroundColor: '#303134',
                  margin: '4px 0 8px 0'
                }} />

                {/* Use another account option */}
                {!showCustomInput ? (
                  <div
                    onClick={() => setShowCustomInput(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '14px 16px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      marginBottom: '20px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      border: '1.5px solid #5f6368',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#e8eaed',
                      flexShrink: 0
                    }}>
                      <UserIcon size={20} />
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#e8eaed' }}>
                      Use another account
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleCustomSubmit} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '12px', color: '#ffffff' }}>
                      Sign in with another Google account
                    </div>
                    <input
                      type="text"
                      placeholder="Name (e.g. Sharick Ahmed)"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="input-pro"
                      style={{
                        marginBottom: '8px',
                        padding: '10px 12px',
                        fontSize: '0.88rem',
                        backgroundColor: '#1e1f20',
                        borderColor: '#3c4043',
                        color: '#fff'
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Google Email (e.g. user@gmail.com)"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      className="input-pro"
                      style={{
                        marginBottom: '12px',
                        padding: '10px 12px',
                        fontSize: '0.88rem',
                        backgroundColor: '#1e1f20',
                        borderColor: '#3c4043',
                        color: '#fff'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowCustomInput(false)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#9aa0a6',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          fontSize: '0.85rem'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          backgroundColor: '#00D4AA',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#0A0E1A',
                          fontWeight: 700,
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        {loading ? 'Signing in...' : 'Sign in'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Privacy & Terms notice (Photo 2) */}
                <p style={{
                  fontSize: '0.82rem',
                  color: '#9aa0a6',
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  Before using this app, you can review FitFuel&apos;s{' '}
                  <span style={{ color: '#00D4AA', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>{' '}
                  and{' '}
                  <span style={{ color: '#00D4AA', cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>.
                </p>
              </div>
            </div>

            {/* Bottom Footer: Language & Help / Privacy / Terms (Photo 2) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 36px 20px',
              fontSize: '0.78rem',
              color: '#9aa0a6',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <span>English (United Kingdom)</span>
                <ChevronDown size={14} />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ cursor: 'pointer' }}>Help</span>
                <span style={{ cursor: 'pointer' }}>Privacy</span>
                <span style={{ cursor: 'pointer' }}>Terms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleAuthButton;
