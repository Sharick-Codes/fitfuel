import { useState, useEffect } from 'react';
import { foodAPI, mealAPI } from '../services/api';
import { Search, Plus, Filter, Play, CheckCircle2, X, ExternalLink, Clock, Flame, Utensils, Sparkles, Check, ChevronRight } from 'lucide-react';

const CUISINE_OPTIONS = ['all', 'indian', 'continental', 'mediterranean'];
const DIET_FILTERS = [
  { id: 'all', label: 'All Diets' },
  { id: 'veg', label: '🌱 Vegetarian' },
  { id: 'nonveg', label: '🍗 Non-Veg' },
  { id: 'highProtein', label: '💪 High Protein' }
];

const MealsPage = () => {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [activeCuisine, setActiveCuisine] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [foods, setFoods] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [foodsRes, mealsRes] = await Promise.all([
        foodAPI.getAll({ category: activeTab }),
        mealAPI.getToday()
      ]);
      setFoods(foodsRes.data.foods || []);
      setTodayMeals(mealsRes.data.meals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      fetchData();
      return;
    }
    setLoading(true);
    try {
      const res = await foodAPI.search(search);
      setFoods((res.data.foods || []).filter(f => f.category === activeTab));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (food) => {
    try {
      await mealAPI.log({
        mealType: activeTab,
        foods: [{ foodId: food._id, quantity: 1 }]
      });
      setToast(`Added ${food.name} to today's ${activeTab}! 🍽️`);
      setTimeout(() => setToast(''), 3000);
      fetchData();
    } catch (err) {
      console.error('Failed to add food', err);
      setToast('Failed to add food');
      setTimeout(() => setToast(''), 3000);
    }
  };

  // Filter foods locally by cuisine and diet tags
  const filteredFoods = foods.filter(food => {
    const matchesCuisine = activeCuisine === 'all' || food.cuisine === activeCuisine;
    const matchesDiet = dietFilter === 'all' || (food.tags && food.tags.includes(dietFilter));
    return matchesCuisine && matchesDiet;
  });

  const currentMeal = todayMeals.find(m => m.mealType === activeTab);

  // Extract YouTube ID from embed URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="page-container animate-fade-in" style={{ position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div className="toast success slide-up" style={{ position: 'fixed', top: 90, right: 24, zIndex: 1000, padding: '12px 20px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#0A0E1A', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,212,170,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Meal Planner & Kitchen 🍽️
          </h1>
          <p>Explore high-protein recipes, authentic Indian cuisines, video tutorials, and log your daily meals</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CUISINE_OPTIONS.map(c => (
            <button
              key={c}
              onClick={() => setActiveCuisine(c)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: activeCuisine === c ? 'var(--primary)' : 'var(--bg-input)',
                color: activeCuisine === c ? '#0A0E1A' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {c === 'all' ? '🌍 All Cuisines' : c === 'indian' ? '🇮🇳 Indian' : c === 'continental' ? '🥗 Continental' : '🫒 Mediterranean'}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Type Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', overflowX: 'auto' }}>
        {[
          { id: 'breakfast', label: '🍳 Breakfast' },
          { id: 'lunch', label: '🍛 Lunch' },
          { id: 'snack', label: '🥨 Snacks' },
          { id: 'dinner', label: '🍲 Dinner' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearch(''); }}
            style={{
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              background: activeTab === tab.id ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg-input)',
              color: activeTab === tab.id ? '#0A0E1A' : 'var(--text-primary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 4px 14px rgba(0,212,170,0.3)' : 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-2" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        {/* Left Column: Search & Foods List */}
        <div>
          {/* Search and Diet Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  className="input-field"
                  placeholder={`Search ${activeTab} foods (e.g. Paneer, Dal, Oats, Chicken)...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 42, paddingRight: search ? 40 : 16 }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => { setSearch(''); fetchData(); }}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-secondary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} /> Search
              </button>
            </form>

            {/* Diet Mode Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {DIET_FILTERS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setDietFilter(d.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: dietFilter === d.id ? 'rgba(0,212,170,0.15)' : 'var(--bg-input)',
                    color: dietFilter === d.id ? 'var(--primary)' : 'var(--text-muted)',
                    border: `1px solid ${dietFilter === d.id ? 'rgba(0,212,170,0.4)' : 'var(--border)'}`,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Foods List */}
          {loading ? (
            <div className="loader-container"><div className="loader"></div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredFoods.map(food => (
                <div
                  key={food._id || food.name}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.2s ease, border-color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{food.name}</h4>
                        {food.cuisine === 'indian' && (
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,107,53,0.15)', color: '#FF6B35', borderRadius: '4px', fontWeight: 700 }}>
                            🇮🇳 Indian
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span>Serving: {food.servingSize} {food.servingUnit}</span>
                        {food.cookTime && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {food.cookTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="badge badge-primary" style={{ fontSize: '0.95rem', padding: '6px 14px', fontWeight: 800 }}>
                      {food.calories} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>kcal</span>
                    </span>
                  </div>

                  {/* Macros Bar */}
                  <div style={{ display: 'flex', gap: '16px', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Protein: {food.protein}g</span>
                    <span style={{ color: '#FF6B35', fontWeight: 600 }}>Carbs: {food.carbs}g</span>
                    <span style={{ color: '#7C5CFC', fontWeight: 600 }}>Fats: {food.fats}g</span>
                    {food.fiber > 0 && <span style={{ color: 'var(--text-muted)' }}>Fiber: {food.fiber}g</span>}
                  </div>

                  {/* Tags & Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {food.tags?.map(tag => (
                        <span key={tag} className="badge" style={{ background: 'var(--bg-secondary)', fontSize: '0.72rem', border: '1px solid var(--border)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedRecipe(food);
                          setCheckedIngredients({});
                        }}
                        style={{
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Play size={14} /> Recipe & Video
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddFood(food)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredFoods.length === 0 && (
                <div className="glass-card" style={{ textAlign: 'center', padding: '50px 24px', color: 'var(--text-muted)' }}>
                  <Utensils size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <h4>No foods match your search</h4>
                  <p style={{ fontSize: '0.9rem' }}>Try clearing filters or search for another delicious ingredient.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Meal Summary & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Today's Meal Summary */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={20} color="var(--primary)" /> Today's {activeTab}
            </h3>

            {currentMeal ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                      {currentMeal.totalMealCalories} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>kcal</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      P: {currentMeal.totalMealProtein}g • C: {currentMeal.totalMealCarbs}g • F: {currentMeal.totalMealFats}g
                    </div>
                  </div>
                  <CheckCircle2 size={32} color="var(--success)" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Logged Items:</div>
                  {currentMeal.foods.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
                      <span>{item.quantity}x {item.name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.totalCalories} kcal</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <Utensils size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>You haven't logged {activeTab} yet today.</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Tap '+ Add' on any recipe on the left to track it!</p>
              </div>
            )}
          </div>

          {/* Quick Cooking Tips Banner */}
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.06), rgba(124,92,252,0.06))', border: '1px solid rgba(0,212,170,0.2)' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--primary)' }}>
              <Sparkles size={18} /> Nutrition Tip
            </h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Combining lentils (dal) with whole grains (roti or brown rice) forms a <strong>complete amino acid profile</strong>, boosting biological protein absorption by up to 30%!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Recipe Details & Video Modal */}
      {selectedRecipe && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div
            className="glass-card slide-up"
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 0,
              border: '1px solid var(--border)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedRecipe.name}</h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span>{selectedRecipe.calories} kcal</span>
                  <span>•</span>
                  <span>P: {selectedRecipe.protein}g</span>
                  <span>•</span>
                  <span>C: {selectedRecipe.carbs}g</span>
                  <span>•</span>
                  <span>F: {selectedRecipe.fats}g</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-muted)', width: 36, height: 36, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            {/* Video Player Container */}
            <div style={{ background: '#000', position: 'relative' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                {selectedRecipe.recipeVideoUrl ? (
                  <iframe
                    src={selectedRecipe.recipeVideoUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={selectedRecipe.name}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    No video URL available
                  </div>
                )}
              </div>
            </div>

            {/* Direct Watch & YouTube Fallback Bar */}
            <div style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                📺 Having playback issues? Open directly on YouTube:
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedRecipe.recipeVideoUrl && (
                  <a
                    href={`https://www.youtube.com/watch?v=${getYouTubeId(selectedRecipe.recipeVideoUrl) || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                  >
                    <ExternalLink size={13} /> Watch on YouTube
                  </a>
                )}
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedRecipe.name + ' healthy recipe')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <Search size={13} /> Search More Videos
                </a>
              </div>
            </div>

            {/* Recipe Content (Ingredients & Steps) */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Ingredients with interactive checkboxes */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.05rem', color: 'var(--primary)' }}>
                  <CheckCircle2 size={18} /> Ingredients Checklist ({selectedRecipe.ingredients?.length || 0})
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedRecipe.ingredients?.map((ing, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleIngredient(idx)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: checkedIngredients[idx] ? 'rgba(0,212,170,0.1)' : 'var(--bg-input)',
                        border: `1px solid ${checkedIngredients[idx] ? 'rgba(0,212,170,0.3)' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textDecoration: checkedIngredients[idx] ? 'line-through' : 'none',
                        color: checkedIngredients[idx] ? 'var(--text-muted)' : 'var(--text-primary)',
                        fontSize: '0.88rem'
                      }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: '4px',
                        border: `2px solid ${checkedIngredients[idx] ? 'var(--primary)' : 'var(--text-muted)'}`,
                        background: checkedIngredients[idx] ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {checkedIngredients[idx] && <Check size={12} color="#0A0E1A" strokeWidth={3} />}
                      </div>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '1.05rem', color: 'var(--accent)' }}>
                  <Utensils size={18} /> Step-by-Step Instructions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedRecipe.instructions?.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: '14px',
                        padding: '12px 16px',
                        background: 'var(--bg-input)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        lineHeight: 1.5
                      }}
                    >
                      <span style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(124,92,252,0.2)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                      }}>
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Meal Action from Modal */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    handleAddFood(selectedRecipe);
                    setSelectedRecipe(null);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  <Plus size={18} /> Log {selectedRecipe.name} to Today's {activeTab}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsPage;

