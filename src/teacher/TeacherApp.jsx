import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

const emptyStudent = {
  name: '',
  email: '',
  grade_level: '',
  phone: '',
  notes: ''
};

const emptyLesson = {
  student_id: '',
  subject: '',
  lesson_date: '',
  start_time: '',
  end_time: '',
  notes: '',
  status: 'planned'
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-GB');
  } catch {
    return '—';
  }
}

export default function TeacherApp({ profile, onSignOut }) {
  const [tab, setTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [toast, setToast] = useState('');
  const [userId, setUserId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id || profile?.id;
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setUserId(currentUserId);

    const [studentsResult, lessonsResult, attendanceResult] = await Promise.all([
      supabase.from('students').select('*').eq('teacher_user_id', currentUserId).order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').eq('teacher_user_id', currentUserId).order('lesson_date', { ascending: true }),
      supabase.from('attendance').select('*').eq('teacher_user_id', currentUserId).order('created_at', { ascending: false })
    ]);

    setStudents(!studentsResult.error ? studentsResult.data || [] : []);
    setLessons(!lessonsResult.error ? lessonsResult.data || [] : []);
    setAttendance(!attendanceResult.error ? attendanceResult.data || [] : []);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => ({
    students: students.length,
    lessons: lessons.length,
    completed: lessons.filter((lesson) => lesson.status === 'completed').length,
    today: lessons.filter((lesson) => lesson.lesson_date === new Date().toISOString().slice(0, 10)).length,
    attendanceRate: attendance.length > 0
      ? Math.round((attendance.filter((entry) => entry.status === 'present').length / attendance.length) * 100)
      : 0
  }), [students.length, lessons, attendance]);

  async function saveStudent(event) {
    event.preventDefault();
    if (!userId) return;

    const payload = {
      teacher_user_id: userId,
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      grade_level: studentForm.grade_level.trim(),
      phone: studentForm.phone.trim(),
      notes: studentForm.notes.trim()
    };

    if (!payload.name) {
      setToast('Student name is required.');
      return;
    }

    if (editingStudentId) {
      const { error } = await supabase.from('students').update(payload).eq('id', editingStudentId);
      if (!error) {
        setEditingStudentId(null);
        setStudentForm(emptyStudent);
        setToast('Student updated.');
        await loadData();
      }
    } else {
      const { error } = await supabase.from('students').insert([payload]);
      if (!error) {
        setStudentForm(emptyStudent);
        setToast('Student created.');
        await loadData();
      }
    }
  }

  async function saveLesson(event) {
    event.preventDefault();
    if (!userId) return;

    const payload = {
      teacher_user_id: userId,
      student_id: lessonForm.student_id || null,
      subject: lessonForm.subject.trim(),
      lesson_date: lessonForm.lesson_date,
      start_time: lessonForm.start_time,
      end_time: lessonForm.end_time,
      notes: lessonForm.notes.trim(),
      status: lessonForm.status || 'planned'
    };

    if (!payload.subject || !payload.lesson_date) {
      setToast('Subject and lesson date are required.');
      return;
    }

    if (editingLessonId) {
      const { error } = await supabase.from('lessons').update(payload).eq('id', editingLessonId);
      if (!error) {
        setEditingLessonId(null);
        setLessonForm(emptyLesson);
        setToast('Lesson updated.');
        await loadData();
      }
    } else {
      const { error } = await supabase.from('lessons').insert([payload]);
      if (!error) {
        setLessonForm(emptyLesson);
        setToast('Lesson created.');
        await loadData();
      }
    }
  }

  async function markAttendance(studentId, status) {
    if (!userId) return;
    const { error } = await supabase.from('attendance').insert([{ teacher_user_id: userId, student_id: studentId, status, created_at: new Date().toISOString() }]);
    if (!error) {
      setToast(`Attendance marked as ${status}.`);
      await loadData();
    }
  }

  function startEditStudent(student) {
    setEditingStudentId(student.id);
    setStudentForm({
      name: student.name || '',
      email: student.email || '',
      grade_level: student.grade_level || '',
      phone: student.phone || '',
      notes: student.notes || ''
    });
    setTab('students');
  }

  function startEditLesson(lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      student_id: lesson.student_id || '',
      subject: lesson.subject || '',
      lesson_date: lesson.lesson_date || '',
      start_time: lesson.start_time || '',
      end_time: lesson.end_time || '',
      notes: lesson.notes || '',
      status: lesson.status || 'planned'
    });
    setTab('lessons');
  }

  return (
    <div className="teacher-app">
      <aside className="teacher-sidebar">
        <div className="auth-brand" style={{ gap: 10 }}>
          <div className="auth-logo">🎓</div>
          <div>
            <strong>Business Plan</strong>
            <span>Teacher Workspace</span>
          </div>
        </div>
        <nav>
          {[
            ['dashboard', '▦', 'Dashboard'],
            ['students', '◉', 'Students'],
            ['lessons', '▣', 'Lessons'],
            ['attendance', '▥', 'Attendance'],
            ['reports', '◫', 'Reports']
          ].map(([key, icon, label]) => (
            <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <button className="teacher-signout" onClick={onSignOut}>Sign Out</button>
      </aside>

      <main className="teacher-main">
        <header className="teacher-header">
          <div>
            <small>TEACHER WORKSPACE</small>
            <h1>{tab[0].toUpperCase() + tab.slice(1)}</h1>
          </div>
          <div className="teacher-user">
            <div>{(profile?.full_name || profile?.email || 'T')[0].toUpperCase()}</div>
            <span><b>{profile?.full_name || 'Teacher'}</b><small>{profile?.email}</small></span>
          </div>
        </header>

        {toast && <div className="admin-toast success" onClick={() => setToast('')}>{toast}</div>}

        {tab === 'dashboard' && (
          <>
            <div className="teacher-stats">
              {[
                ['Total Students', stats.students, '#3B82F6'],
                ['Upcoming Lessons', stats.lessons, '#8B5CF6'],
                ['Lessons Today', stats.today, '#10B981'],
                ['Attendance Rate', `${stats.attendanceRate}%`, '#F59E0B'],
                ['Recent Activity', `${attendance.length} records`, '#EC4899']
              ].map(([label, value, color]) => (
                <div className="teacher-stat" key={label}><span>{label}</span><strong style={{ color }}>{value}</strong></div>
              ))}
            </div>
            <div className="teacher-grid">
              <section className="teacher-panel">
                <h2>Upcoming lessons</h2>
                {loading && <div className="admin-empty-state">Loading…</div>}
                {!loading && lessons.slice(0, 4).map((lesson) => (
                  <div className="teacher-row" key={lesson.id}>
                    <div className="teacher-avatar">L</div>
                    <div>
                      <b>{lesson.subject || 'Lesson'}</b>
                      <span>{formatDate(lesson.lesson_date)} · {lesson.start_time || '—'} </span>
                    </div>
                    <strong>{lesson.status || 'planned'}</strong>
                  </div>
                ))}
              </section>
              <section className="teacher-panel">
                <h2>Quick actions</h2>
                <button className="teacher-action" onClick={() => setTab('lessons')}>＋ New lesson</button>
                <button className="teacher-action" onClick={() => setTab('students')}>＋ Add student</button>
                <button className="teacher-action" onClick={() => setTab('attendance')}>✓ Mark attendance</button>
              </section>
            </div>
          </>
        )}

        {tab === 'students' && (
          <div className="teacher-grid">
            <section className="teacher-panel">
              <h2>{editingStudentId ? 'Edit student' : 'Create student'}</h2>
              <form className="admin-workspace-form" onSubmit={saveStudent}>
                <label>Name<input value={studentForm.name} onChange={(event) => setStudentForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label>Email<input value={studentForm.email} onChange={(event) => setStudentForm((current) => ({ ...current, email: event.target.value }))} /></label>
                <label>Grade<input value={studentForm.grade_level} onChange={(event) => setStudentForm((current) => ({ ...current, grade_level: event.target.value }))} /></label>
                <label>Phone<input value={studentForm.phone} onChange={(event) => setStudentForm((current) => ({ ...current, phone: event.target.value }))} /></label>
                <label>Notes<textarea value={studentForm.notes} onChange={(event) => setStudentForm((current) => ({ ...current, notes: event.target.value }))} rows={3} /></label>
                <div className="admin-drawer-actions">
                  <button type="submit" className="admin-action-btn approve">{editingStudentId ? 'Save student' : 'Create student'}</button>
                  {editingStudentId && <button type="button" className="admin-action-btn" onClick={() => { setEditingStudentId(null); setStudentForm(emptyStudent); }}>Cancel</button>}
                </div>
              </form>
            </section>
            <section className="teacher-panel">
              <h2>Students</h2>
              {students.map((student) => (
                <div className="teacher-row" key={student.id}>
                  <div className="teacher-avatar">{(student.name || 'S')[0].toUpperCase()}</div>
                  <div><b>{student.name}</b><span>{student.email || student.grade_level || 'Student'}</span></div>
                  <div className="admin-actions-row">
                    <button type="button" className="admin-action-btn" onClick={() => startEditStudent(student)}>Edit</button>
                    <button type="button" className="admin-action-btn" onClick={() => markAttendance(student.id, 'present')}>Present</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === 'lessons' && (
          <div className="teacher-grid">
            <section className="teacher-panel">
              <h2>{editingLessonId ? 'Edit lesson' : 'Create lesson'}</h2>
              <form className="admin-workspace-form" onSubmit={saveLesson}>
                <label>Student<select value={lessonForm.student_id} onChange={(event) => setLessonForm((current) => ({ ...current, student_id: event.target.value }))}>
                  <option value="">Select student</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                </select></label>
                <label>Subject<input value={lessonForm.subject} onChange={(event) => setLessonForm((current) => ({ ...current, subject: event.target.value }))} required /></label>
                <label>Date<input type="date" value={lessonForm.lesson_date} onChange={(event) => setLessonForm((current) => ({ ...current, lesson_date: event.target.value }))} required /></label>
                <label>Start time<input type="time" value={lessonForm.start_time} onChange={(event) => setLessonForm((current) => ({ ...current, start_time: event.target.value }))} /></label>
                <label>End time<input type="time" value={lessonForm.end_time} onChange={(event) => setLessonForm((current) => ({ ...current, end_time: event.target.value }))} /></label>
                <label>Status<select value={lessonForm.status} onChange={(event) => setLessonForm((current) => ({ ...current, status: event.target.value }))}>
                  <option value="planned">planned</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select></label>
                <label>Notes<textarea value={lessonForm.notes} onChange={(event) => setLessonForm((current) => ({ ...current, notes: event.target.value }))} rows={3} /></label>
                <div className="admin-drawer-actions">
                  <button type="submit" className="admin-action-btn approve">{editingLessonId ? 'Save lesson' : 'Create lesson'}</button>
                  {editingLessonId && <button type="button" className="admin-action-btn" onClick={() => { setEditingLessonId(null); setLessonForm(emptyLesson); }}>Cancel</button>}
                </div>
              </form>
            </section>
            <section className="teacher-panel">
              <h2>Lessons</h2>
              {lessons.map((lesson) => (
                <div className="teacher-row" key={lesson.id}>
                  <div className="teacher-avatar">L</div>
                  <div><b>{lesson.subject}</b><span>{formatDate(lesson.lesson_date)} · {lesson.start_time || '—'}</span></div>
                  <div className="admin-actions-row">
                    <button type="button" className="admin-action-btn" onClick={() => startEditLesson(lesson)}>Edit</button>
                    <button type="button" className="admin-action-btn" onClick={() => markAttendance(lesson.student_id, 'present')}>Attend</button>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === 'attendance' && (
          <section className="teacher-panel">
            <h2>Attendance history</h2>
            {attendance.map((item) => (
              <div className="teacher-row" key={item.id}>
                <div className="teacher-avatar">A</div>
                <div><b>{item.status}</b><span>{formatDate(item.created_at)}</span></div>
                <strong>{item.student_id || '—'}</strong>
              </div>
            ))}
          </section>
        )}

        {tab === 'reports' && (
          <section className="teacher-panel">
            <h2>Reports</h2>
            <div className="admin-summary-grid">
              <div className="admin-summary-card"><span>Total lessons</span><strong>{stats.lessons}</strong></div>
              <div className="admin-summary-card"><span>Completed lessons</span><strong>{stats.completed}</strong></div>
              <div className="admin-summary-card"><span>Attendance rate</span><strong>{stats.attendanceRate}%</strong></div>
              <div className="admin-summary-card"><span>Students</span><strong>{stats.students}</strong></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
