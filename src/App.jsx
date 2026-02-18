import React, { useState, useEffect } from 'react';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

// --- SUB-COMPONENTS ---
const HomeView = ({ food, setFood, calories, setCalories, addEntry, totalCalories, dailyGoal, progress, entries }) => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <section style={calorieStyles.heroCard}>
        <div style={calorieStyles.progressContainer}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#2a2a2e" strokeWidth="10" />
            <circle 
              cx="60" cy="60" r="54" fill="none" stroke="#e8c123" strokeWidth="10" 
              strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * progress) / 100}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div style={calorieStyles.progressText}>
            <span style={calorieStyles.bigNum}>{totalCalories}</span>
            <span style={calorieStyles.smallLabel}>/ {dailyGoal}</span>
          </div>
        </div>
      </section>
      
      <form onSubmit={addEntry} style={calorieStyles.glassForm}>
        <input style={calorieStyles.neuInput} placeholder="Food name" value={food} onChange={(e)=>setFood(e.target.value)} />
        <div style={calorieStyles.inputRow}>
          <input style={calorieStyles.neuInput} type="number" placeholder="kcal" value={calories} onChange={(e)=>setCalories(e.target.value)} />
          <button type="submit" style={calorieStyles.plusBtn}>+</button>
        </div>
      </form>

      <div style={calorieStyles.historyScrollArea}>
        <div style={calorieStyles.historyList}>
          {entries.map(entry => (
            <div key={entry.id} style={calorieStyles.neuCard}>
              <div>
                <span style={calorieStyles.foodName}>{entry.food}</span>
                <span style={calorieStyles.foodTime}>{entry.time}</span>
              </div>
              <span style={calorieStyles.foodCal}>+{entry.calories}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

  </>
);

const SettingsView = ({ dailyGoal, setDailyGoal, setEntries }) => (
  <div style={calorieStyles.settingsPanel}>
    <h2 style={{ marginBottom: '20px' }}>User Settings</h2>
    <label style={calorieStyles.label}>Daily Calorie Goal</label>
    <input 
      style={calorieStyles.neuInput} 
      type="number" 
      value={dailyGoal} 
      onChange={(e) => {
        const value = parseInt(e.target.value) || 0;
        // Math.max(0, value) ensures the goal is at least 0
        setDailyGoal(Math.max(0, value)); 
      }}
    />
    <button style={calorieStyles.clearBtn} onClick={() => { if(confirm("Clear logs?")) setEntries([]) }}>Clear Daily History</button>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');

  // 1. Database Hooks
  const dailyGoalData = useLiveQuery(() => db.settings.get('daily_goal'));
  const dailyGoal = dailyGoalData?.value || 2500;
  const today = new Date().toISOString().split('T')[0];

  const entries = useLiveQuery(
    () => db.entries.where('date').equals(today).reverse().toArray()
  ) || [];

  // 2. Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // 3. Database Actions
  const updateGoal = async (newGoal) => {
    await db.settings.put({ key: 'daily_goal', value: newGoal });
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!food || !calories || calories <= 0) return;

    await db.entries.add({
      food,
      calories: parseInt(calories),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: today
    });

    setFood('');
    setCalories('');
  };

  const clearLogs = async () => {
    if (confirm("Clear logs for today?")) {
      // You can either clear everything or just today's entries
      await db.entries.where('date').equals(today).delete();
    }
  };

  const totalCalories = Math.max(0, entries.reduce((sum, item) => sum + item.calories, 0));
  const progress = Math.min((totalCalories / dailyGoal) * 100, 100);

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 'home' ? (
            <HomeView 
              food={food} setFood={setFood} 
              calories={calories} setCalories={setCalories} 
              addEntry={addEntry} totalCalories={totalCalories} 
              dailyGoal={dailyGoal} progress={progress} 
              entries={entries} 
            />
          ) : (
            <SettingsView 
              dailyGoal={dailyGoal} 
              setDailyGoal={updateGoal} 
              setEntries={clearLogs} 
            />
          )}
        </div>
        
        <nav style={calorieStyles.navbar}>
          <button style={{...calorieStyles.navItem, color: view === 'home' ? '#EFBF04' : '#888'}} onClick={() => setView('home')}>
            🏠 <span>Dashboard</span>
          </button>
          <button style={{...calorieStyles.navItem, color: view === 'settings' ? '#EFBF04' : '#888'}} onClick={() => setView('settings')}>
            ⚙️ <span>Settings</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

// --- STYLES OBJECT (Critical - App will crash without this) ---
const styles = {
  body: { backgroundColor: '#121214', width: '100vw', color: '#fff', margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', justifyContent: 'center' },
  container: { maxWidth: '500px', margin: 'auto', height: '100dvh', display: 'flex', flexDirection: 'column', padding: '70px 20px 100px 20px', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden' },
};

const calorieStyles = {
  heroCard: { // circular progress card at the top
    background: 'linear-gradient(145deg, #1e1e21, #161619)', borderRadius: '30px', padding: '40px 20px', 
    textAlign: 'center', boxShadow: '20px 20px 60px #0f0f11, -20px -20px 60px #151517', marginBottom: '30px'
  },
  progressContainer: { position: 'relative', display: 'inline-block' },
  progressText: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  bigNum: { fontSize: '28px', fontWeight: '800', display: 'block' },
  smallLabel: { fontSize: '12px', color: '#888' },
  glassForm: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', padding: '20px' },
  neuInput: { backgroundColor: '#1a1a1d', border: 'none', borderRadius: '15px', padding: '15px', color: '#fff', fontSize: '16px', boxShadow: 'inset 4px 4px 8px #0d0d0f, inset -4px -4px 8px #27272b', width: '100%', boxSizing: 'border-box' }, // Input format style
  inputRow: { display: 'flex', gap: '10px' },
  plusBtn: { backgroundColor: '#EFBF04', color: '#000', border: 'none', borderRadius: '15px', width: '60px', fontSize: '24px', fontWeight: 'bold', display: 'flex', justifyContent: 'center'},
  historyScrollArea: { flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '0 20px 20px 20px', },
  historyList: { display: 'flex', flexDirection: 'column', overflowY: 'scroll', gap: '15px', padding: '20px' },
  neuCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#1a1a1d', borderRadius: '20px', boxShadow: '8px 8px 16px #0d0d0f, -8px -8px 16px #27272b' },
  foodName: { fontSize: '16px', fontWeight: '600', display: 'block' },
  foodTime: { fontSize: '12px', color: '#666' },
  foodCal: { color: '#EFBF04', fontWeight: '700', fontSize: '18px' },
  navbar: { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '70px', backgroundColor: '#1a1a1d', display: 'flex', borderTop: '1px solid #2a2a2e', zIndex: 1000 },
  navItem: { flex: 1, background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '12px', color: '#888', fontWeight: 'bold' },
  settingsPanel: { padding: '20px', borderRadius: '20px', backgroundColor: '#1a1a1d', boxShadow: '8px 8px 16px #0d0d0f' },
  label: { display: 'block', marginBottom: '10px', fontSize: '14px', color: '#888' },
  clearBtn: { marginTop: '40px', backgroundColor: '#e73e3e', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', width: '100%', fontWeight: 'bold' }
};

export default App;