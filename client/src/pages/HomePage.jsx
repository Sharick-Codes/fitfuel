import { Link } from 'react-router-dom';
import {
  Flame, Calculator, Utensils, Target, Activity, Droplets,
  Moon, Trophy, ChevronRight, Star, Zap, ShieldCheck, Sparkles, Check
} from 'lucide-react';

const features = [
  { icon: Calculator, title: 'Smart Calorie Architecture', desc: 'Precise Mifflin-St Jeor & TDEE formulas customized for your exact body composition and activity level.', color: '#00D4AA' },
  { icon: Target, title: 'Flexible Goal Strategies', desc: 'Switch dynamically between aggressive fat shredding, lean hypertrophy, or body recomposition.', color: '#FF6B35' },
  { icon: Utensils, title: 'Rich Nutrition Catalog', desc: '100+ wholesome foods with macronutrient distributions, preparation details, and embedded recipe tutorials.', color: '#7C5CFC' },
  { icon: Activity, title: 'Visual Body Milestones', desc: 'Monitor weight velocity, calorie trends, and adherence scores over weekly and monthly windows.', color: '#4ADE80' },
  { icon: Droplets, title: 'Dynamic Hydration Matrix', desc: 'Intelligent water intake calculations scaling automatically with workout intensity and weather.', color: '#38BDF8' },
  { icon: Trophy, title: 'Streak Gamification', desc: 'Level up from Rookie to Legend, earning badges and unlocking XP milestones every day you log.', color: '#FBBF24' },
  { icon: Moon, title: 'Recovery & Fasting Suite', desc: 'Intermittent fasting schedules (16:8, 18:6, OMAD) paired with restful sleep cycle tracking.', color: '#C084FC' },
  { icon: Zap, title: 'Training Day Cycling', desc: 'Higher carb targets on demanding leg/push days, calorie drops on restorative rest days.', color: '#F472B6' },
];

const HomePage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Navigation Header */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        position: 'relative',
        zIndex: 10,
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
        background: 'rgba(10, 14, 26, 0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 212, 170, 0.35)'
          }}>
            <Flame size={24} color="#0A0E1A" />
          </div>
          <div>
            <span style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              letterSpacing: '-0.5px'
            }}>
              FIT<span style={{ color: 'var(--primary)' }}>FUEL</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '9px 20px', fontSize: '0.9rem' }}>
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '9px 22px', fontSize: '0.9rem' }}>
            Start Free <ChevronRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '90px 24px 70px',
        position: 'relative'
      }}>
        {/* Ambient Glows */}
        <div style={{
          position: 'absolute', top: '5%', left: '15%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(0, 212, 170, 0.12), transparent 70%)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '15%', right: '10%',
          width: '450px', height: '450px',
          background: 'radial-gradient(circle, rgba(124, 92, 252, 0.14), transparent 70%)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto' }}>
          <div className="badge-pill badge-teal" style={{ marginBottom: '24px', padding: '6px 18px', fontSize: '0.85rem' }}>
            <Sparkles size={14} /> The High-Performance Nutrition Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.5vw, 4.4rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '24px'
          }}>
            Fuel With Science. <br />
            <span className="gradient-text-teal">Transform Your Physique.</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 40px',
            lineHeight: 1.7
          }}>
            Precision calorie targets, smart macro allocation, video-assisted healthy meals, and streak-driven habits designed to turn goals into reality.
          </p>

          {/* Action CTAs */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700 }}>
              Build Your Profile Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 600 }}>
              Sign In to Account
            </Link>
          </div>

          {/* Highlights bar */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '24px',
            padding: '12px 24px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-full)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--primary)" /> Zero Ads or Clutter
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--primary)" /> Secure User Authentication
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={16} color="var(--primary)" /> Mifflin-St Jeor Precision
            </span>
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '24px',
            marginTop: '70px',
            padding: '32px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)'
          }}>
            {[
              { value: '100+', label: 'Curated Foods & Recipes', color: 'var(--primary)' },
              { value: '98%', label: 'Target Macro Accuracy', color: 'var(--secondary-light)' },
              { value: '23', label: 'Unlockable Badges', color: 'var(--accent-light)' },
              { value: '4.9 ★', label: 'Community Rating', color: '#FBBF24' }
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-heading)',
                  color: stat.color,
                  lineHeight: 1.1,
                  marginBottom: '6px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="badge-pill badge-purple" style={{ marginBottom: '14px' }}>
            Engineered For Performance
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Everything You Need To{' '}
            <span className="gradient-text-teal">Master Your Nutrition</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.05rem' }}>
            No complicated spreadsheets. Just clean, intelligent tools designed to give you clarity and results.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card"
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = `${feature.color}66`;
                e.currentTarget.style.boxShadow = `0 12px 30px ${feature.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{
                  width: 50,
                  height: 50,
                  borderRadius: 'var(--radius-md)',
                  background: `${feature.color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  border: `1px solid ${feature.color}33`
                }}>
                  <feature.icon size={26} color={feature.color} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', fontWeight: 700 }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '0 32px 90px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-card-elevated" style={{
          padding: '48px 40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.08), rgba(124, 92, 252, 0.08)), var(--bg-secondary)',
          border: '1px solid rgba(0, 212, 170, 0.3)'
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Take Control of Your Fitness?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 32px', fontSize: '1.02rem' }}>
            Create your account in under 60 seconds and start tracking your meals with precision today.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', fontWeight: 700 }}>
              Join FitFuel Now <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '36px 48px',
        textAlign: 'center',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Flame size={18} color="var(--primary)" />
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>FitFuel Pro</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
          © 2026 FitFuel. Empowering athletes and everyday fitness enthusiasts worldwide.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
