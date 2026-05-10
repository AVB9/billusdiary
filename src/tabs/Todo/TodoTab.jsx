import React, { useState, useEffect } from 'react';

const TodoTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const getDateKey = (date) => {
    if (!(date instanceof Date) || isNaN(date)) date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `todo_${y}-${m}-${d}`;
  };

  const loadTasks = () => {
    const rawTasks = JSON.parse(localStorage.getItem(getDateKey(currentDate))) || [];
    const processedTasks = rawTasks.map(t => ({
      ...t,
      status: t.status || (t.done ? 'done' : 'todo')
    }));
    setTasks(processedTasks);
  };

  const saveTasks = (newTasks) => {
    localStorage.setItem(getDateKey(currentDate), JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  useEffect(() => {
    loadTasks();
  }, [currentDate]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      status: 'todo',
      subjectId: selectedSubjectId,
      created: new Date().toISOString()
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    setNewTaskText('');
  };

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const nextStatus = task.status === 'todo' ? 'in-progress' : (task.status === 'in-progress' ? 'done' : 'todo');
        return { ...task, status: nextStatus };
      }
      return task;
    });
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getDateDisplay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(currentDate);
    compareDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((compareDate - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === -1) return "Yesterday";
    if (diffDays === 1) return "Tomorrow";
    return currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  return (
    <div className="tab-content active" id="tab-todo">
      <div className="todo-header">
        <button onClick={() => navigateDate(-1)}>&lt;</button>
        <h2 onClick={() => setCurrentDate(new Date())}>{getDateDisplay()}</h2>
        <button onClick={() => navigateDate(1)}>&gt;</button>
      </div>

      <div className="todo-input">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Add a new task..."
        />
        <button onClick={addTask}>Add</button>
      </div>

      <div className="todo-lists">
        <div className="todo-column">
          <h3>Todo</h3>
          {getTasksByStatus('todo').map(task => (
            <div key={task.id} className="todo-item" onClick={() => toggleTaskStatus(task.id)}>
              <span>{task.text}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>×</button>
            </div>
          ))}
        </div>

        <div className="todo-column">
          <h3>In Progress</h3>
          {getTasksByStatus('in-progress').map(task => (
            <div key={task.id} className="todo-item" onClick={() => toggleTaskStatus(task.id)}>
              <span>{task.text}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>×</button>
            </div>
          ))}
        </div>

        <div className="todo-column">
          <h3>Done</h3>
          {getTasksByStatus('done').map(task => (
            <div key={task.id} className="todo-item done" onClick={() => toggleTaskStatus(task.id)}>
              <span>{task.text}</span>
              <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoTab;