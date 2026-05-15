import React, { useState, useEffect } from 'react';

const MomentumTab = () => {
  const [habits, setHabits] = useState([]);
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    const savedHabits = JSON.parse(localStorage.getItem('momentumHabits')) || [];
    setHabits(savedHabits);
  };

  const saveHabits = (newHabits) => {
    localStorage.setItem('momentumHabits', JSON.stringify(newHabits));
    setHabits(newHabits);
  };

  const getDateKey = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
  };

  const getTodayStr = () => getDateKey(new Date());

  const calculateStreak = (habit) => {
    if (habit.completions.length === 0) return 0;
    const dates = habit.completions.sort((a,b) => new Date(b) - new Date(a));
    const today = getTodayStr();

    let currentStreak = 0;
    let missedBuffer = 0;

    const checkDate = new Date();
    let loopSafeGuard = 0;

    while(loopSafeGuard < 1000) {
      loopSafeGuard++;
      const checkStr = getDateKey(checkDate);

      if (dates.includes(checkStr)) {
        currentStreak++;
        missedBuffer = 0;
      } else {
        if (checkStr !== today) {
          missedBuffer++;
          if (missedBuffer > 2) break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return currentStreak;
  };

  const calculateLongestStreak = (habit) => {
    let max = 0;
    let temp = 0;
    const sorted = [...habit.completions].sort((a,b) => new Date(a) - new Date(b));

    for(let i=0; i<sorted.length; i++) {
      if (i === 0) { temp = 1; max = 1; continue; }
      const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / (1000*60*60*24);
      if (diff <= 3) { temp++; }
      else { temp = 1; }
      if (temp > max) max = temp;
    }
    return max;
  };

  const toggleCompletion = (habitId, dateStr) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || habit.archived) return;

    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0,0,0,0);
    const todayDate = new Date();
    todayDate.setHours(0,0,0,0);

    if (selectedDate > todayDate) {
      alert("Cannot complete future dates!");
      return;
    }

    const newHabits = habits.map(h => {
      if (h.id === habitId) {
        const completions = h.completions.includes(dateStr)
          ? h.completions.filter(d => d !== dateStr)
          : [...h.completions, dateStr];
        return { ...h, completions };
      }
      return h;
    });

    saveHabits(newHabits);
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit = {
      id: 'hab_' + Date.now(),
      name: newHabitName.trim(),
      createdAt: getTodayStr(),
      archived: false,
      completions: []
    };

    const newHabits = [newHabit, ...habits];
    saveHabits(newHabits);
    setNewHabitName('');
    setShowAddModal(false);
  };

  const archiveHabit = (habitId) => {
    const newHabits = habits.map(h =>
      h.id === habitId ? { ...h, archived: !h.archived } : h
    );
    saveHabits(newHabits);
  };

  const deleteHabit = (habitId) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      const newHabits = habits.filter(h => h.id !== habitId);
      saveHabits(newHabits);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentViewDate(newDate);
  };

  const generateCalendarDays = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Monday first

    const days = [];

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        dayNum: prevMonthDays - i
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
        dayNum: d
      });
    }

    // Next month days
    const remainingCells = 42 - days.length; // 6 weeks * 7 days
    for (let d = 1; d <= remainingCells; d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
        dayNum: d
      });
    }

    return days;
  };

  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);
  const calendarDays = generateCalendarDays();
  const monthName = currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="tab-content active" id="tab-momentum">
      <div className="momentum-header">
        <h1>Momentum</h1>
        <button onClick={() => setShowAddModal(true)} className="add-habit-btn">+ Add Habit</button>
      </div>

      <div className="habits-section">
        <h3>Active Habits</h3>
        {activeHabits.length === 0 ? (
          <p className="empty-state">No active habits. Create your first habit!</p>
        ) : (
          <div className="habits-list">
            {activeHabits.map(habit => (
              <div key={habit.id} className="habit-item">
                <div className="habit-info">
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-streak">🔥 {calculateStreak(habit)} day streak</span>
                </div>
                <div className="habit-actions">
                  <button onClick={() => setSelectedHabit(habit)}>View Calendar</button>
                  <button onClick={() => archiveHabit(habit.id)}>Archive</button>
                  <button onClick={() => deleteHabit(habit.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {archivedHabits.length > 0 && (
        <div className="habits-section">
          <h3>Archived Habits</h3>
          <div className="habits-list">
            {archivedHabits.map(habit => (
              <div key={habit.id} className="habit-item archived">
                <div className="habit-info">
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-streak">Best: {calculateLongestStreak(habit)} days</span>
                </div>
                <div className="habit-actions">
                  <button onClick={() => archiveHabit(habit.id)}>Unarchive</button>
                  <button onClick={() => deleteHabit(habit.id)} className="delete-btn">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedHabit && (
        <div className="habit-calendar-modal">
          <div className="modal-header">
            <h2>{selectedHabit.name}</h2>
            <button onClick={() => setSelectedHabit(null)}>×</button>
          </div>

          <div className="calendar-header">
            <button onClick={() => navigateMonth(-1)}>&lt;</button>
            <h3>{monthName}</h3>
            <button onClick={() => navigateMonth(1)}>&gt;</button>
          </div>

          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="weekday-header">{day}</div>
            ))}

            {calendarDays.map((day, index) => {
              const dateKey = getDateKey(day.date);
              const isCompleted = selectedHabit.completions.includes(dateKey);
              const isToday = dateKey === getTodayStr();
              const isFuture = day.date > new Date();

              return (
                <div
                  key={index}
                  className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}`}
                  onClick={() => !isFuture && toggleCompletion(selectedHabit.id, dateKey)}
                >
                  {day.dayNum}
                  {isCompleted && <div className="completion-dot">✓</div>}
                </div>
              );
            })}
          </div>

          <div className="habit-stats">
            <div className="stat">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{calculateStreak(selectedHabit)} days</span>
            </div>
            <div className="stat">
              <span className="stat-label">Longest Streak</span>
              <span className="stat-value">{calculateLongestStreak(selectedHabit)} days</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Completions</span>
              <span className="stat-value">{selectedHabit.completions.length}</span>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Habit</h3>
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              placeholder="Enter habit name..."
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={addHabit}>Create Habit</button>
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MomentumTab;