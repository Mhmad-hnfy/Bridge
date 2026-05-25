"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [lessons, setLessons] = useState([]);
    const [extraCourses, setExtraCourses] = useState([]);
    const [newLesson, setNewLesson] = useState({ title: '', videoUrl: '', maxViews: 3, courseId: '' });
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [authorized, setAuthorized] = useState(false);

    const [activeTab, setActiveTab] = useState('Overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState([]);
    const [newCodeCount, setNewCodeCount] = useState(1);
    const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [newCourse, setNewCourse] = useState({ title: '', description: '', price: '', level: 'Grade 12', image: '', isFree: false });
    const [editingCourseId, setEditingCourseId] = useState(null);

    const [students, setStudents] = useState([]);
    const [statsData, setStatsData] = useState([]);
    const [levels, setLevels] = useState([]);
    const [newLevelName, setNewLevelName] = useState('');

    const [courseSearch, setCourseSearch] = useState('');
    const [lessonSearch, setLessonSearch] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [codeSearch, setCodeSearch] = useState('');
    const [notification, setNotification] = useState(null);

    const showToast = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchData = async () => {
        const [resCourses, resLessons, resStats, resStudents, resLevels] = await Promise.all([
            fetch('/api/courses'),
            fetch('/api/lessons'),
            fetch('/api/stats'),
            fetch('/api/students'),
            fetch('/api/levels')
        ]);
        const courses = await resCourses.json();
        const lessonsData = await resLessons.json();
        const stats = await resStats.json();
        const studentsData = await resStudents.json();
        const levelsData = await resLevels.json();
        
        setExtraCourses(courses);
        setLessons(lessonsData);
        setStatsData(Array.isArray(stats) ? stats : []);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setLevels(Array.isArray(levelsData) ? levelsData : []);
        if (courses.length > 0 && !selectedCourse) setSelectedCourse(courses[0].id);
    };

    const handleAddLevel = async () => {
        if (!newLevelName) return;
        try {
            const res = await fetch('/api/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newLevelName })
            });
            if (res.ok) {
                setNewLevelName('');
                fetchData();
                showToast('Level Added Successfully!');
            } else {
                const err = await res.json();
                showToast(err.error || 'Failed to add level', 'error');
            }
        } catch (error) {
            showToast('Connection Error: ' + error.message, 'error');
        }
    };

    const handleDeleteLevel = async (id) => {
        if (window.confirm('Delete this level?')) {
            const res = await fetch(`/api/levels?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        }
    };

    const fetchCodes = async () => {
        const res = await fetch('/api/codes');
        if (res.ok) setGeneratedCodes(await res.json());
    };

    const deleteCode = async (id) => {
        if (window.confirm('Delete this code? If used, the student will lose access.')) {
            const res = await fetch(`/api/codes?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchCodes();
        }
    };

    const bulkDeleteCodes = async () => {
        const selectedIds = generatedCodes.filter(c => c.selected).map(c => c.id);
        if (selectedIds.length === 0) return showToast('No codes selected', 'error');
        if (window.confirm(`Delete ${selectedIds.length} codes?`)) {
            const res = await fetch(`/api/codes?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
            if (res.ok) fetchCodes();
        }
    };

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'admin') {
            window.location.href = '/login';
        } else {
            setAuthorized(true);
            fetchData();
            fetchCodes();
        }
    }, []);

    if (!authorized) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black">Checking Authorization...</div>;

    const generateCodes = async () => {
        if (!selectedCourse) return showToast('Please select a course', 'error');
        const res = await fetch('/api/codes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: selectedCourse, count: newCodeCount, maxUses: newCodeMaxUses })
        });
        if (res.ok) {
            fetchCodes();
            showToast(`${newCodeCount} codes generated!`);
        } else {
            const err = await res.json();
            showToast('Error Generating Codes: ' + (err.error || 'Unknown error'), 'error');
        }
    };

    const handleAddLesson = async () => {
        if (!newLesson.title || !newLesson.videoUrl || !newLesson.courseId) return showToast('Please fill all details', 'error');
        
        const res = await fetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newLesson, id: editingLessonId })
        });

        if (res.ok) {
            fetchData();
            setEditingLessonId(null);
            setNewLesson({ title: '', videoUrl: '', maxViews: 3, courseId: newLesson.courseId });
            showToast(editingLessonId ? 'Lesson updated!' : 'Lesson added!');
        } else {
            const err = await res.json();
            showToast(err.error || 'Failed to save lesson', 'error');
        }
    };

    const deleteLesson = async (id) => {
        if (window.confirm('Delete this lesson?')) {
            const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        }
    };

    const handleDeleteCourse = async (id) => {
        if (window.confirm('Delete this course and all its lessons?')) {
            const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        }
    };

    const handlePublishCourse = async () => {
        if (!newCourse.title) return showToast('Please enter a course title', 'error');
        if (newCourse.price === '' && !newCourse.isFree) return showToast('Please enter a price or mark as free', 'error');
        
        const res = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newCourse, id: editingCourseId, price: parseFloat(newCourse.price) || 0 })
        });

        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Non-JSON response:', text);
        }

        if (res.ok) {
            fetchData();
            showToast(editingCourseId ? 'Course Updated Successfully!' : 'Course Published Successfully!');
            setNewCourse({ title: '', description: '', price: '', level: 'Grade 12', image: '', isFree: false });
            setEditingCourseId(null);
        } else {
            showToast(data.error || 'Server Error: Please restart your terminal/server.', 'error');
            if (data.details) console.error('Error Details:', data.details);
        }
    };

    const menuItems = [
        { name: 'Overview', icon: '📊' },
        { name: 'Courses', icon: '📚' },
        { name: 'Lessons', icon: '🎬' },
        { name: 'Students', icon: '👥' },
        { name: 'Codes', icon: '🔑' },
        { name: 'Levels', icon: '🎓' },
    ];

    const allAdminCourses = extraCourses || [];
    const filteredCourses = allAdminCourses.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()));
    const filteredLessons = (lessons || []).filter(l => l.title.toLowerCase().includes(lessonSearch.toLowerCase()));
    const filteredStudents = (students || []).filter(s => (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) || (s.email || '').toLowerCase().includes(studentSearch.toLowerCase()) || (s.phone || '').toLowerCase().includes(studentSearch.toLowerCase()));
    const filteredCodes = (generatedCodes || []).filter(c => (c.code || '').toLowerCase().includes(codeSearch.toLowerCase()) || (c.course || '').toLowerCase().includes(codeSearch.toLowerCase()));

    const recentStudents = students.slice(0, 5);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen flex">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{ font-family: "Plus Jakarta Sans", sans-serif; }
                `}
            </style>

            <aside className={`w-72 bg-slate-900 text-slate-300 flex-col border-r border-slate-800 absolute lg:relative z-50 h-screen transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full lg:translate-x-0 hidden lg:flex'}`}>
                <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">Σ</div>
                        <span className="text-xl font-black text-white tracking-tight">ADMIN</span>
                    </Link>
                    <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(false)}>✖</button>
                </div>

                <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                setActiveTab(item.name);
                                setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                                activeTab === item.name ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="text-xl opacity-70">{item.icon}</span>
                            {item.name}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">I</div>
                        <div>
                            <p className="text-sm font-bold text-white">Eng:Mohamed Hanafy</p>
                            <p className="text-xs text-slate-500">Super Admin</p>
                        </div>
                        <button onClick={handleLogout} className="ml-auto text-slate-500 hover:text-white">🚪</button>
                    </div>
                </div>
            </aside>

            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

            <main className="flex-grow flex flex-col h-screen overflow-hidden">
                <header className="bg-white h-20 px-6 md:px-8 flex items-center gap-4 border-b border-slate-200">
                    <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(true)}>☰</button>
                    <h1 className="text-2xl font-black text-slate-900">{activeTab}</h1>
                </header>

                <div className="flex-grow overflow-y-auto p-8 space-y-8">
                    
                    {activeTab === 'Overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {statsData.map((stat, i) => (
                                    <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white shadow-sm`}>{stat.icon}</div>
                                            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{stat.change}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-xl font-black text-slate-900">Recent Students</h3>
                                    <button onClick={() => setActiveTab('Students')} className="text-blue-600 font-bold text-sm hover:underline">View All Students</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Level</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Joined Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {recentStudents.length > 0 ? recentStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">{student.name ? student.name[0] : '?'}</div>
                                                        <p className="font-bold text-slate-900">{student.name}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm text-slate-600">{student.email}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-600">{student.level}</td>
                                                    <td className="px-8 py-5 text-sm text-slate-500">{new Date(student.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-bold">No students registered yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Courses' && (
                        <div className="space-y-8">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-8">{editingCourseId ? 'Edit Course' : 'Publish New Course'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                                        <input type="text" placeholder="e.g. Advanced Calculus" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newCourse.title} onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Price (EGP) - Set 0 for Free</label>
                                        <input type="number" placeholder="49.99" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: e.target.value})} />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Academic Level</label>
                                        <select className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newCourse.level} onChange={(e) => setNewCourse({...newCourse, level: e.target.value})}>
                                            {(levels || []).map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Course Image (Upload)</label>
                                        <div className="flex items-center gap-4">
                                            <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition-all" onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setNewCourse({...newCourse, image: reader.result});
                                                    reader.readAsDataURL(file);
                                                }
                                            }} />
                                            {newCourse.image && !newCourse.image.startsWith('http') && <img src={newCourse.image} alt="Preview" className="w-16 h-12 rounded-lg object-cover" />}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Free Course?</label>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setNewCourse({...newCourse, isFree: !newCourse.isFree})}
                                                className={`w-14 h-8 rounded-full transition-all relative ${newCourse.isFree ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${newCourse.isFree ? 'left-7' : 'left-1'}`}></div>
                                            </button>
                                            <span className="text-sm font-bold text-slate-600">{newCourse.isFree ? 'Yes, Anyone can watch' : 'No, Requires activation code'}</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                                        <textarea placeholder="Write a compelling description for your course..." className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none h-32 focus:border-blue-500 transition-all" value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}></textarea>
                                    </div>
                                    <button onClick={handlePublishCourse} className="md:col-span-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                                        {editingCourseId ? 'Update Course' : 'Publish Course'}
                                    </button>
                                    {editingCourseId && (
                                        <button 
                                            onClick={() => {
                                                setEditingCourseId(null);
                                                setNewCourse({ title: '', description: '', price: '', level: 'Grade 12', image: '', isFree: false });
                                            }}
                                            className="md:col-span-2 py-2 text-slate-500 font-bold hover:text-slate-900 transition-all"
                                        >
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-slate-900">All Courses</h3>
                                <input type="text" placeholder="Search courses..." className="px-5 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-500 w-64 shadow-sm" value={courseSearch} onChange={e => setCourseSearch(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredCourses.map(course => (
                                    <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 bg-slate-100 rounded-xl overflow-hidden">
                                                <img src={course.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{course.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-500">{course.level} • {course.price} EGP</p>
                                                    {course.isFree && <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Free</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { 
                                                setEditingCourseId(course.id); 
                                                setNewCourse({
                                                    title: course.title,
                                                    description: course.description || '',
                                                    price: course.price.toString(),
                                                    level: course.level,
                                                    image: course.image || '',
                                                    isFree: course.isFree || false
                                                });
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl">✏️</button>
                                            <button onClick={() => handleDeleteCourse(course.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Lessons' && (
                        <div className="space-y-8">
                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-8">{editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Lesson Title</label>
                                        <input type="text" placeholder="e.g. Introduction to Algebra" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Video URL (YouTube/Vimeo)</label>
                                        <input type="text" placeholder="https://youtube.com/watch?v=..." className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newLesson.videoUrl} onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})} />
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Assign to Course</label>
                                        <select className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newLesson.courseId} onChange={(e) => setNewLesson({...newLesson, courseId: e.target.value})}>
                                            <option value="">Select Course</option>
                                            {allAdminCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Max Views Allowed <span className="text-blue-500 font-normal">(0 for Unlimited)</span></label>
                                        <input type="number" placeholder="e.g. 5" className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 transition-all" value={newLesson.maxViews} onChange={(e) => setNewLesson({...newLesson, maxViews: e.target.value === '' ? '' : parseInt(e.target.value)})} />
                                    </div>
                                    <button onClick={handleAddLesson} className="md:col-span-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">{editingLessonId ? 'Update Lesson' : 'Add Lesson'}</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mb-4 mt-8">
                                <h3 className="text-xl font-bold text-slate-900">All Lessons</h3>
                                <input type="text" placeholder="Search lessons..." className="px-5 py-3 rounded-xl bg-white border border-slate-200 outline-none focus:border-blue-500 w-64 shadow-sm" value={lessonSearch} onChange={e => setLessonSearch(e.target.value)} />
                            </div>
                            <div className="space-y-4">
                                {filteredLessons.map(lesson => (
                                    <div key={lesson.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                                            <p className="text-xs text-slate-500">Course ID: {lesson.courseId}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingLessonId(lesson.id); setNewLesson(lesson); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl">✏️</button>
                                            <button onClick={() => deleteLesson(lesson.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Students' && (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900">All Students</h3>
                                <div className="flex items-center gap-4">
                                    <input type="text" placeholder="Search students..." className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 w-64 text-sm" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                                    <span className="text-sm font-bold text-slate-400">{filteredStudents.length} Total</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Student</th>
                                            <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Email</th>
                                            <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Phone</th>
                                            <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Level</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id}>
                                                <td className="px-8 py-5 font-bold text-slate-900">{student.name}</td>
                                                <td className="px-8 py-5 text-sm text-slate-600">{student.email}</td>
                                                <td className="px-8 py-5 text-sm text-slate-600">{student.phone}</td>
                                                <td className="px-8 py-5 text-sm text-slate-600">{student.level}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Codes' && (
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-6">Generate Activation Codes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Course</label>
                                        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none">
                                            {allAdminCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Quantity (Codes)</label>
                                        <input type="number" value={newCodeCount} onChange={(e) => setNewCodeCount(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Uses per Code</label>
                                        <input type="number" value={newCodeMaxUses} onChange={(e) => setNewCodeMaxUses(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" />
                                    </div>
                                    <button onClick={generateCodes} className="py-3.5 px-6 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg transition-all active:scale-95">Generate</button>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="text-xl font-black text-slate-900">Codes History</h3>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" placeholder="Search codes..." className="px-5 py-2 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500 w-64 text-sm" value={codeSearch} onChange={e => setCodeSearch(e.target.value)} />
                                        <button onClick={bulkDeleteCodes} className="text-red-500 font-bold text-sm">Delete Selected</button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-8 py-4"><input type="checkbox" onChange={(e) => setGeneratedCodes(generatedCodes.map(c => ({...c, selected: e.target.checked})))} /></th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Code</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Course</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Usage</th>
                                                <th className="px-8 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredCodes.map((code) => (
                                                <tr key={code.id}>
                                                    <td className="px-8 py-4"><input type="checkbox" checked={code.selected || false} onChange={(e) => setGeneratedCodes(generatedCodes.map(c => c.id === code.id ? {...c, selected: e.target.checked} : c))} /></td>
                                                    <td className="px-8 py-4 font-mono font-bold text-blue-600">{code.code}</td>
                                                    <td className="px-8 py-4 text-sm text-slate-600">{code.course}</td>
                                                    <td className="px-8 py-4 text-sm font-bold text-slate-900">{code.usedCount} / {code.maxUses}</td>
                                                    <td className="px-8 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${code.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{code.status}</span></td>
                                                    <td className="px-8 py-4 text-right">
                                                        <button onClick={() => { navigator.clipboard.writeText(code.code); showToast('Copied to clipboard!'); }} className="p-2 text-blue-600">📋</button>
                                                        <button onClick={() => deleteCode(code.id)} className="p-2 text-red-500">🗑️</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Levels' && (
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-6">Academic Levels</h3>
                                <div className="flex gap-4">
                                    <input type="text" placeholder="Add Level" className="flex-grow px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none" value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} />
                                    <button onClick={handleAddLevel} className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl">Add Level</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(levels || []).map(l => (
                                    <div key={l.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                                        <span className="font-bold text-slate-900">{l.name}</span>
                                        <button onClick={() => handleDeleteLevel(l.id)} className="p-2 text-red-500">🗑️</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-10 duration-300 backdrop-blur-md border ${
                    notification.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-emerald-500/90 border-emerald-400 text-white'
                }`}>
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xl">
                        {notification.type === 'error' ? '✕' : '✓'}
                    </div>
                    <div>
                        <p className="font-black text-sm">{notification.type === 'error' ? 'Error' : 'Success'}</p>
                        <p className="text-xs font-bold opacity-90">{notification.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
