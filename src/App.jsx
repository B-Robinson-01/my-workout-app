import React, { useState, useEffect } from 'react';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

// Style
import './App.css';

// --- SUB-COMPONENTS ---
const HomeView = ({ food, setFood, calories, setCalories, protein, setProtein, addEntry, totalCalories, dailyGoal, progress, totalProtein, proteinGoal, proteinProgress, entries }) => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* "Hero Card" - The Display at the Top of the App */}
      <section className="hero-card">
        {/* Calorie Progress */}
        <div className="progress-container">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2e" strokeWidth="10" />
            <circle 
              cx="60" cy="60" r="54" fill="none" stroke="#e8c123" strokeWidth="10" 
              strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * progress) / 100}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="progress-text">
            <span className="big-num">{totalCalories}</span>
            <span className="small-label">/ {dailyGoal}</span>
          </div>
        </div>
        
        {/* Protein Tracking */}
        <div style={{ marginTop: '20px', width: '100%', padding: '0 10px', boxSizing: 'border-box' }}>
          {/* Label Row */}
          <div className="protein-header">
            <span style={{ fontWeight: 'bold' }}>PROTEIN</span>
            <span style={{ color: '#fff' }}>{totalProtein}g / {proteinGoal}g</span>
          </div>

          {/* Progress Track */}
          <div className="linear-track">
            {/* Progress Fill - Dynamic width must stay inline */}
            <div 
              className="linear-bar" 
              style={{ width: `${Math.min(proteinProgress, 100)}%` }} 
            />
          </div>
        </div>
      </section>
      
      {/* Entry Form */}
      <form onSubmit={addEntry} className="glass-form">
        <input 
          className="input-field" 
          placeholder="Food name" 
          value={food} 
          onChange={(e)=>setFood(e.target.value)} 
        />
        <div className="input-row">
          <div style={{ display:'flex', flex: 1 }}>
            <input 
              className="input-field" 
              type="number" 
              placeholder="cal" 
              value={calories} 
              onChange={(e)=>setCalories(Math.max(0,e.target.value))} 
            />
          </div>
          <div style={{ display:'flex', gap:'10px', flex: 1 }}>
            <input 
              className="input-field" 
              type="number" 
              placeholder="prot (g)" 
              value={protein} 
              onChange={(e)=>setProtein(Math.max(0,e.target.value))} 
            />
            <button type="submit" className="plus-btn">+</button>
          </div>
        </div>
      </form>

      {/* Scrolling Display of Each Item Added */}
      <div className="history-scroll-area">
        <div className="history-list">
          {entries.map(entry => (
            <div key={entry.id} className="entry-card">
              <div>
                <span className="food-name">{entry.food}</span> 
                <span className="food-time"> 
                  {entry.time} • <span style={{color: '#888'}}>{entry.protein}g protein</span>
                </span>
              </div>
              <span className="food-cal">+{entry.calories}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

const SettingsView = ({ dailyGoal, setDailyGoal, proteinGoal, setProteinGoal, setEntries }) => (
  <div className="settings-panel">
    <h2 style={{ marginBottom: '20px' }}>User Settings</h2>
    
    <label className="input-label">Daily Calorie Goal</label>
    <input 
      className="input-field" 
      type="number" 
      value={dailyGoal} 
      onChange={(e) => {
        const value = parseInt(e.target.value) || 0;
        setDailyGoal(Math.max(0, value)); 
      }}
    />
    
    <label className="input-label">Daily Protein Goal</label>
    <input 
      className="input-field" 
      type="number" 
      value={proteinGoal}
      onChange={(e) => {
        const value = parseInt(e.target.value) || 0;
        setProteinGoal(Math.max(0, value)); 
      }}
    />
    
    <button 
      className="clear-btn" 
      onClick={() => { if(confirm("Clear logs for Today?")) setEntries([]) }}
    >
      Clear Daily History
    </button>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');

  // Database Hooks (LiveQuery)
  const today = new Date().toISOString().split('T')[0];
  const entries = useLiveQuery(
    () => db.entries.where('date').equals(today).reverse().toArray()
  ) || [];

  const dailyGoalData = useLiveQuery(() => db.settings.get('daily_goal'));
  const dailyGoal = dailyGoalData?.value || 2500;
  
  const proteinGoalData = useLiveQuery(() => db.settings.get('protein_goal'))
  const proteinGoal = proteinGoalData?.value || 150;
  
  const totalCalories = Math.max(0, entries.reduce((sum, item) => sum + (item.calories || 0), 0));
  const totalProtein = Math.max(0, entries.reduce((sum, item) => sum + (item.protein || 0), 0));

  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);
  const proteinProgress = Math.min((totalProtein / proteinGoal) * 100, 100);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const updateGoal = async (newGoal) => {
    await db.settings.put({ key: 'daily_goal', value: newGoal });
  };

  const updateProtein = async (newGoal) => {
    await db.settings.put({ key: 'protein_goal', value: newGoal });
  };

  // adding data
  const addEntry = async (e) => {
    e.preventDefault();
    if (!food || !calories || !protein || calories <= 0) return;

    // Adding to our table
    await db.entries.add({
      food,
      calories: parseInt(calories),
      protein: parseInt(protein),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: today
    });

    setFood('');
    setCalories('');
    setProtein('');
  };

  const clearLogs = async () => {
    await db.entries.where('date').equals(today).delete();
  };

  return (
    // Note: 'body' class on this div is optional since we styled the actual <body> tag in CSS
    <div className="app-frame"> 
      <div className="app-container">
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 'home' ? (
            <HomeView 
              food={food} setFood={setFood} 
              calories={calories} setCalories={setCalories} 
              protein={protein} setProtein={setProtein} 
              addEntry={addEntry} totalCalories={totalCalories} 
              dailyGoal={dailyGoal} progress={progress} 
              totalProtein={totalProtein}
              proteinGoal={proteinGoal}
              proteinProgress={proteinProgress}
              entries={entries} 
            />
          ) : (
            <SettingsView 
              dailyGoal={dailyGoal} 
              setDailyGoal={updateGoal} 
              proteinGoal={proteinGoal}
              setProteinGoal={updateProtein}
              setEntries={clearLogs} 
            />
          )}
        </div>
        
        <nav className="navbar">
          <button className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
            🏠 <span>Dashboard</span>
          </button>
          <button className={`nav-item ${view === 'workout' ? 'active' : ''}`} onClick={() => setView('settings')}>
            💪 <span>Workout Planner</span>
          </button>
          <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => setView('settings')}>
            ⚙️ <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;