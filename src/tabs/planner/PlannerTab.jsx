import React, { useState, useEffect } from 'react';

const PlannerTab = () => {
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [targets, setTargets] = useState({});
  const [completed, setCompleted] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTask, setModalTask] = useState({ topic: '', subjectId: null });

  useEffect(() => {
    // Initialize currentViewDate to first day of month
    const date = new Date();
    date.setDate(1);
    setCurrentViewDate(date);

    // Load data from localStorage
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedTargets = JSON.parse(localStorage.getItem('plannerTargets')) || {};
      const savedCompleted = JSON.parse(localStorage.getItem('plannerCompleted')) || [];
      const savedSubjects = JSON.parse(localStorage.getItem('appSubjects')) || [{ id: 'group_default', name: 'General', isDeletable: false, subjects: [] }];

      setTargets(savedTargets);
      setCompleted(savedCompleted);
      setSubjects(savedSubjects.flatMap(group => group.subjects || []));
    } catch (e) {
      console.error('Error loading planner data:', e);
    }
  };

  const saveTargets = (newTargets) => {
    localStorage.setItem('plannerTargets', JSON.stringify(newTargets));
    setTargets(newTargets);
  };

  const saveCompleted = (newCompleted) => {
    localStorage.setItem('plannerCompleted', JSON.stringify(newCompleted));
    setCompleted(newCompleted);
  };

  const getDateKey = (date) => {
    if (!(date instanceof Date) || isNaN(date)) date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const generateMonthData = () => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDay = new Date(year, month, 1).getDay();
    if (startDay === 0) startDay = 7;

    const todayObjReal = new Date();
    todayObjReal.setHours(0, 0, 0, 0);
    const todayStr = getDateKey(todayObjReal);

    const days = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateKey = getDateKey(dateObj);
      const dayTask = targets[dateKey] || null;
      const isCompleted = completed.includes(dateKey);
      const isOverdue = (dayTask && !isCompleted && dateObj < todayObjReal);
      const isFuture = dateObj > todayObjReal;

      let subjectData = null;
      if (dayTask && dayTask.subjectId) {
        subjectData = subjects.find(s => s.id === dayTask.subjectId) || null;
      }

      days.push({
        dayNum: d,
        dateObj,
        dateKey,
        isToday: dateKey === todayStr,
        isCompleted,
        isOverdue,
        isFuture,
        hasTask: !!dayTask,
        taskTopic: dayTask ? dayTask.topic : '',
        subject: subjectData
      });
    }

    return { year, month, startDay, daysInMonth, todayStr, todayObjReal, days };
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentViewDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentViewDate(newDate);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.dateKey);
    const existingTask = targets[day.dateKey] || { topic: '', subjectId: null };
    setModalTask(existingTask);
    setShowModal(true);
  };

  const toggleCompletion = (dateKey, dateObj) => {
    const todayObjReal = new Date();
    todayObjReal.setHours(0, 0, 0, 0);

    if (!targets[dateKey]) return;

    if (dateObj > todayObjReal) {
      alert("Cannot complete future tasks!");
      return;
    }

    const newCompleted = completed.includes(dateKey)
      ? completed.filter(id => id !== dateKey)
      : [...completed, dateKey];

    saveCompleted(newCompleted);
  };

  const saveTask = () => {
    const newTargets = { ...targets };
    if (modalTask.topic.trim()) {
      newTargets[selectedDate] = modalTask;
    } else {
      delete newTargets[selectedDate];
      // Also remove from completed if task is deleted
      const newCompleted = completed.filter(id => id !== selectedDate);
      saveCompleted(newCompleted);
    }
    saveTargets(newTargets);
    setShowModal(false);
  };

  const deleteTask = () => {
    const newTargets = { ...targets };
    delete newTargets[selectedDate];
    saveTargets(newTargets);

    const newCompleted = completed.filter(id => id !== selectedDate);
    saveCompleted(newCompleted);
    setShowModal(false);
  };

  const monthData = generateMonthData();
  const monthName = currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="tab-content active" id="tab-planner">
      <div className="planner-header">
        <button onClick={() => navigateMonth(-1)}>&lt;</button>
        <h2>{monthName}</h2>
        <button onClick={() => navigateMonth(1)}>&gt;</button>
      </div>

      <div className="calendar-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthData.startDay - 1 }, (_, i) => (
          <div key={`empty-${i}`} className="day-cell empty"></div>
        ))}

        {/* Day cells */}
        {monthData.days.map(day => (
          <div
            key={day.dateKey}
            className={`day-cell ${day.isToday ? 'today' : ''} ${day.isCompleted ? 'completed' : ''} ${day.isOverdue ? 'overdue' : ''} ${day.hasTask ? 'has-task' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <div className="date-num">{day.dayNum}</div>
            {day.hasTask && (
              <div className="task-content">
                {day.subject && (
                  <span
                    className="subject-tag"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${day.subject.color} 20%, rgba(30, 30, 30, 0.45))`,
                      color: day.subject.color,
                      borderColor: day.subject.color
                    }}
                  >
                    {day.subject.name}
                  </span>
                )}
                <span className="task-topic">{day.taskTopic}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal planner-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Plan for {selectedDate}</h3>

            <div className="modal-section">
              <label>Task:</label>
              <input
                type="text"
                value={modalTask.topic}
                onChange={(e) => setModalTask({ ...modalTask, topic: e.target.value })}
                placeholder="What do you want to accomplish?"
              />
            </div>

            <div className="modal-section">
              <label>Subject:</label>
              <select
                value={modalTask.subjectId || ''}
                onChange={(e) => setModalTask({ ...modalTask, subjectId: e.target.value || null })}
              >
                <option value="">No subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div className="modal-buttons">
              <button onClick={saveTask}>Save</button>
              {targets[selectedDate] && (
                <button onClick={deleteTask} className="delete-btn">Delete</button>
              )}
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerTab;