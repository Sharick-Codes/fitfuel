import { useState } from 'react';
import { ShoppingBag, Check, Copy, CheckCircle2, X, Share2, Printer } from 'lucide-react';

const DEFAULT_GROCERY_ITEMS = [
  { category: '🥛 Dairy & High-Protein', items: ['Low-Fat Paneer (400g)', 'Eggs (1 Dozen)', 'Soya Chunks (250g)', 'Greek / Low-Fat Curd (500g)', 'Skinless Chicken Breast (500g)'] },
  { category: '🌾 Lentils & Whole Grains', items: ['Yellow Moong Dal (500g)', 'Rolled Oats (500g)', 'Besan / Gram Flour (500g)', 'Rajma / Kidney Beans (250g)', 'Brown Rice / Jeera Rice (1kg)'] },
  { category: '🥬 Fresh Produce & Greens', items: ['Fresh Palak / Spinach (2 Bunches)', 'Tomatoes (500g)', 'Onions (1kg)', 'Ginger & Garlic Paste', 'Green Chillies & Fresh Coriander', 'Lemons (4 pcs)'] },
  { category: '🌿 Healthy Fats & Spices', items: ['Roasted Makhana / Fox Nuts (100g)', 'Cold-Pressed Mustard / Olive Oil', 'Turmeric, Cumin & Garam Masala', 'Whole Roasted Chana & Gur (Jaggery)'] }
];

const GroceryListModal = ({ isOpen, onClose }) => {
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleItem = (name) => {
    setChecked(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleCopy = () => {
    let text = '🛒 FITFUEL PRO — SMART GROCERY LIST:\n\n';
    DEFAULT_GROCERY_ITEMS.forEach(cat => {
      text += `[${cat.category}]\n`;
      cat.items.forEach(it => {
        text += `${checked[it] ? '✅' : '⬜'} ${it}\n`;
      });
      text += '\n';
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
          maxWidth: '640px',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '28px',
          border: '1px solid rgba(0, 212, 170, 0.3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShoppingBag size={22} color="#0A0E1A" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                Smart Grocery List 🛒
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Weekly ingredients aggregated from your 36 Indian & fitness recipes
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

        {/* Action Bar */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              color: copied ? 'var(--success)' : 'var(--text-primary)',
              borderColor: copied ? 'var(--success)' : 'var(--border)'
            }}
          >
            {copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
            {copied ? 'Copied to Clipboard! 📋' : 'Copy List for WhatsApp / Notes'}
          </button>
        </div>

        {/* Grocery Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {DEFAULT_GROCERY_ITEMS.map((cat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px' }}>
                {cat.category}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {cat.items.map((it, idx) => {
                  const isChecked = checked[it];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleItem(it)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: isChecked ? 'rgba(0,212,170,0.08)' : 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: 16, height: 16, borderRadius: '4px',
                        border: `2px solid ${isChecked ? 'var(--primary)' : 'var(--text-muted)'}`,
                        background: isChecked ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={11} color="#0A0E1A" strokeWidth={3} />}
                      </div>
                      <span>{it}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroceryListModal;
