"use client";
import { useState, useEffect } from 'react';
import { Loader2, Plus, Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import styles from './DashboardTab.module.css';

export default function DashboardTab({ userRole, token }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For Admin task creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (userRole !== 'Admin') return;
    try {
      const res = await fetch('/api/users', { headers: { 'x-auth-token': token } });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        if (data.users.length > 0) setNewTask(prev => ({ ...prev, assignedTo: data.users[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchUsers();
    }
  }, [token, userRole]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewTask({ title: '', description: '', assignedTo: users[0]?._id || '', dueDate: '' });
        fetchTasks();
      } else {
        alert(data.error || 'Failed to create task');
      }
    } catch (err) {
      alert('Error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchTasks(); // Refresh tasks
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Adjust for Monday start (or Sunday depending on locale, we use generic here)

  const getTasksForDate = (day) => {
    return tasks.filter(t => {
      const d = new Date(t.dueDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  return (
    <div className={styles.dashboardTab}>
      <div className={styles.header}>
        <h2>لوحة المهام (التقويم)</h2>
        {userRole === 'Admin' && (
          <button className={styles.addBtn} onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> إضافة مهمة
          </button>
        )}
      </div>

      <div className={styles.calendarControls}>
        <button onClick={prevMonth}>&laquo; السابق</button>
        <h3>{currentDate.toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth}>التالي &raquo;</button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className={styles.calendarGrid}>
          {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(d => (
            <div key={d} className={styles.dayName}>{d}</div>
          ))}
          
          {blanks.map(b => <div key={`blank-${b}`} className={styles.calendarCellEmpty}></div>)}
          
          {days.map(day => {
            const dayTasks = getTasksForDate(day);
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            
            return (
              <div key={day} className={`${styles.calendarCell} ${isToday ? styles.today : ''}`}>
                <div className={styles.dateNumber}>{day}</div>
                <div className={styles.tasksContainer}>
                  {dayTasks.map(task => (
                    <div 
                      key={task._id} 
                      className={`${styles.taskPill} ${task.status === 'Completed' ? styles.taskCompleted : ''}`}
                      onClick={() => toggleTaskStatus(task)}
                      title={task.description}
                    >
                      {task.status === 'Completed' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span className={styles.taskTitle}>{task.title}</span>
                      {userRole === 'Admin' && task.assignedTo?.username && (
                         <span className={styles.assignedBadge}>{task.assignedTo.username}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>إضافة مهمة جديدة</h3>
            <form onSubmit={handleCreateTask} className={styles.form}>
              <div className={styles.formGroup}>
                <label>عنوان المهمة</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>الوصف (اختياري)</label>
                <textarea value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>تاريخ الاستحقاق</label>
                <input required type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>تعيين إلى</label>
                <select value={newTask.assignedTo} onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}>
                  {users.map(u => <option key={u._id} value={u._id}>{u.username} ({u.role})</option>)}
                </select>
              </div>
              
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowCreateModal(false)} className={styles.cancelBtn}>إلغاء</button>
                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
