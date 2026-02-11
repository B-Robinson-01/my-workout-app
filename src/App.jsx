import React, { useState, useEffect } from 'react';

// --- SUB-COMPONENTS ---
const HomeView = ({ food, setFood, calories, setCalories, addEntry, totalCalories, dailyGoal, progress, entries }) => (
  <>
    <section style={styles.heroCard}>
      <div style={styles.progressContainer}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2e" strokeWidth="10" />
          <circle 
            cx="60" cy="60" r="54" fill="none" stroke="#00ff88" strokeWidth="10" 
            strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * progress) / 100}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={styles.progressText}>
          <span style={styles.bigNum}>{totalCalories}</span>
          <span style={styles.smallLabel}>/ {dailyGoal}</span>
        </div>
      </div>
    </section>

    <form onSubmit={addEntry} style={styles.glassForm}>
      <input style={styles.neuInput} placeholder="Food name" value={food} onChange={(e)=>setFood(e.target.value)} />
      <div style={styles.inputRow}>
        <input style={styles.neuInput} type="number" placeholder="kcal" value={calories} onChange={(e)=>setCalories(e.target.value)} />
        <button type="submit" style={styles.plusBtn}>+</button>
      </div>
    </form>

    <div style={styles.historyList}>
      {entries.map(entry => (
        <div key={entry.id} style={styles.neuCard}>
          <div>
            <span style={styles.foodName}>{entry.food}</span>
            <span style={styles.foodTime}>{entry.time}</span>
          </div>
          <span style={styles.foodCal}>+{entry.calories}</span>
        </div>
      ))}
    </div>
  </>
);

const SettingsView = ({ dailyGoal, setDailyGoal, setEntries }) => (
  <div style={styles.settingsPanel}>
    <h2 style={{ marginBottom: '20px' }}>User Settings</h2>
    <label style={styles.label}>Daily Calorie Goal</label>
    <input 
      style={styles.neuInput} 
      type="number" 
      value={dailyGoal} 
      onChange={(e) => setDailyGoal(parseInt(e.target.value) || 0)} 
    />
    <button style={styles.clearBtn} onClick={() => { if(confirm("Clear logs?")) setEntries([]) }}>Clear Daily History</button>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [entries, setEntries] = useState([]);
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('daily_goal')) || 2500);

  useEffect(() => {
    const saved = localStorage.getItem('daily_calories');
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('daily_calories', JSON.stringify(entries));
    localStorage.setItem('daily_goal', dailyGoal.toString());
  }, [entries, dailyGoal]);

  const addEntry = (e) => {
    e.preventDefault();
    if (!food || !calories) return;
    const newEntry = {
      id: Date.now(),
      food,
      calories: parseInt(calories),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setEntries([newEntry, ...entries]);
    setFood('');
    setCalories('');
  };

  const totalCalories = entries.reduce((sum, item) => sum + item.calories, 0);
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        {view === 'home' ? (
          <HomeView 
            food={food} setFood={setFood} 
            calories={calories} setCalories={setCalories} 
            addEntry={addEntry} totalCalories={totalCalories} 
            dailyGoal={dailyGoal} progress={progress} 
            entries={entries} 
          />
        ) : (
          <SettingsView dailyGoal={dailyGoal} setDailyGoal={setDailyGoal} setEntries={setEntries} />
        )}
        
        <nav style={styles.navbar}>
          <button style={{...styles.navItem, color: view === 'home' ? '#00ff88' : '#888'}} onClick={() => setView('home')}>
            🏠 <span>Dashboard</span>
          </button>
          <button style={{...styles.navItem, color: view === 'settings' ? '#00ff88' : '#888'}} onClick={() => setView('settings')}>
            ⚙️ <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

// --- STYLES OBJECT (Critical - App will crash without this) ---
const styles = {
  body: { backgroundColor: '#121214', minHeight: '100vh', color: '#fff', padding: '20px 20px 100px 20px', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' },
  container: { maxWidth: '420px', margin: '0 auto' },
  heroCard: { 
    background: 'linear-gradient(145deg, #1e1e21, #161619)', borderRadius: '30px', padding: '40px 20px', 
    textAlign: 'center', boxShadow: '20px 20px 60px #0f0f11, -20px -20px 60px #151517', marginBottom: '30px'
  },
  progressContainer: { position: 'relative', display: 'inline-block' },
  progressText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  bigNum: { fontSize: '28px', fontWeight: '800', display: 'block' },
  smallLabel: { fontSize: '12px', color: '#888' },
  glassForm: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' },
  neuInput: { backgroundColor: '#1a1a1d', border: 'none', borderRadius: '15px', padding: '15px', color: '#fff', fontSize: '16px', boxShadow: 'inset 4px 4px 8px #0d0d0f, inset -4px -4px 8px #27272b', width: '100%', boxSizing: 'border-box' },
  inputRow: { display: 'flex', gap: '10px' },
  plusBtn: { backgroundColor: '#00ff88', color: '#000', border: 'none', borderRadius: '15px', width: '60px', fontSize: '24px', fontWeight: 'bold' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  neuCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#1a1a1d', borderRadius: '20px', boxShadow: '8px 8px 16px #0d0d0f, -8px -8px 16px #27272b' },
  foodName: { fontSize: '16px', fontWeight: '600', display: 'block' },
  foodTime: { fontSize: '12px', color: '#666' },
  foodCal: { color: '#00ff88', fontWeight: '700', fontSize: '18px' },
  navbar: { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70px', backgroundColor: '#1a1a1d', display: 'flex', borderTop: '1px solid #2a2a2e', zIndex: 1000 },
  navItem: { flex: 1, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', color: '#888', fontWeight: 'bold' },
  settingsPanel: { padding: '20px', borderRadius: '20px', backgroundColor: '#1a1a1d', boxShadow: '8px 8px 16px #0d0d0f' },
  label: { display: 'block', marginBottom: '10px', fontSize: '14px', color: '#888' },
  clearBtn: { marginTop: '40px', backgroundColor: '#ff4444', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', width: '100%', fontWeight: 'bold' }
};

export default App;