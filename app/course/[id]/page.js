"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const mathCourses = [
    {
        id: 1,
        title: "Calculus Mastery",
        instructor: "Eng:Mohamed Hanafy",
        price: 49.99,
        description: "Master limits, derivatives, and integrals with practical problem-solving sessions. This course is designed to take you from the basics of functions to advanced integration techniques used in engineering and physics.",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop",
        category: "Calculus",
        lessonsCount: 24,
        curriculum: [
            { title: "Introduction to Limits", duration: "15:30" },
            { title: "The Derivative Concept", duration: "22:10" },
            { title: "Rules of Differentiation", duration: "45:00" },
            { title: "Applications of Derivatives", duration: "38:20" },
            { title: "Fundamental Theorem of Calculus", duration: "52:15" },
            { title: "Integration by Parts", duration: "41:10" },
        ]
    },
    {
        id: 2,
        title: "Advanced Algebra",
        instructor: "Eng:Mohamed Hanafy",
        price: 39.00,
        description: "Deep dive into linear equations, complex numbers, and polynomial functions. We focus on building a strong logical foundation for algebraic manipulation.",
        image: "https://images.unsplash.com/photo-1509228468518-180dd482180c?q=80&w=1200&auto=format&fit=crop",
        category: "Algebra",
        lessonsCount: 18,
        curriculum: [
            { title: "Complex Numbers System", duration: "25:00" },
            { title: "Matrices and Determinants", duration: "35:40" },
            { title: "Polynomial Functions", duration: "28:20" },
            { title: "Systems of Equations", duration: "42:15" },
        ]
    },
    {
        id: 3,
        title: "Geometry & Trigonometry",
        instructor: "Eng:Mohamed Hanafy",
        price: 35.00,
        description: "Explore the world of shapes, angles, and trigonometric identities in depth. Perfect for students aiming for architectural or geometric excellence.",
        image: "https://images.unsplash.com/photo-1632571401005-458b9d244391?q=80&w=1200&auto=format&fit=crop",
        category: "Geometry",
        lessonsCount: 20,
        curriculum: [
            { title: "Coordinate Geometry", duration: "30:00" },
            { title: "Trigonometric Identities", duration: "45:00" },
            { title: "Circles and Their Properties", duration: "38:20" },
        ]
    }
];

import SecurePlayer from '../../../_Componants/SecurePlayer';

export default function CourseDetail() {
    const params = useParams();
    const courseId = params.id; // Use as string now (cuid)

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeLesson, setActiveLesson] = useState(null);
    const [courseLessons, setCourseLessons] = useState([]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        if (!userStr && !role) {
            window.location.href = '/login';
            return;
        }
        fetchCourseData();
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const res = await fetch(`/api/courses?id=${courseId}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data);
                setCourseLessons(data.lessons || []);
                
                const role = localStorage.getItem('role');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                
                let unlocked = [];
                try {
                    unlocked = typeof user.unlockedCourses === 'string' ? JSON.parse(user.unlockedCourses) : (user.unlockedCourses || []);
                } catch(e) { unlocked = []; }

                if (role === 'admin') {
                    setIsEnrolled(true);
                } else if (data.isFree) {
                    setIsEnrolled(true);
                } else if (unlocked.includes(courseId)) {
                    setIsEnrolled(true);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Course...</div>;
    if (!course) return <div className="min-h-screen flex items-center justify-center">Course not found</div>;

    const handleRedeem = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) return alert('Please log in again');

        const res = await fetch('/api/codes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: redeemCode, courseId, studentId: user.id })
        });

        if (res.ok) {
            setIsSuccess(true);
            // Update local user session
            let unlocked = [];
            try {
                unlocked = typeof user.unlockedCourses === 'string' ? JSON.parse(user.unlockedCourses) : (user.unlockedCourses || []);
            } catch(e) { unlocked = []; }
            
            if (!unlocked.includes(courseId)) unlocked.push(courseId);
            const updatedUser = { ...user, unlockedCourses: unlocked };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            setIsEnrolled(true);
            alert(`Success! You have unlocked ${course.title}`);
            setTimeout(() => {
                setShowRedeemModal(false);
                setIsSuccess(false);
                setRedeemCode('');
            }, 2000);
        } else {
            const err = await res.json();
            alert(err.error || 'Invalid or already used code. Please try again.');
        }
    };

    const handleLessonClick = async (lesson) => {
        if (!isEnrolled) {
            setShowRedeemModal(true);
            return;
        }
        
        const role = localStorage.getItem('role');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (role !== 'admin' && !user.id) {
            alert('Please log in again to view this lesson.');
            window.location.href = '/login';
            return;
        }

        // Admin doesn't consume views
        if (role === 'admin') {
            setActiveLesson(lesson);
            return;
        }

        try {
            // Check if allowed without incrementing (we'll implement a 'check' mode in API)
            const res = await fetch(`/api/lessons/view?lessonId=${lesson.id}&studentId=${user.id}&mode=check`);
            const data = await res.json();
            
            if (res.ok && data.allowed) {
                setActiveLesson({...lesson, viewsRemaining: data.viewsRemaining});
            } else {
                alert(data.error || data.message || 'Access denied');
                setShowRedeemModal(true);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to load lesson.');
        }
    };

    const handleCloseLesson = async () => {
        if (!activeLesson) return;
        
        const role = localStorage.getItem('role');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (role !== 'admin' && user.id) {
            // Increment view only on close
            try {
                await fetch('/api/lessons/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId: activeLesson.id, studentId: user.id })
                });
            } catch (e) { console.error('Failed to increment view on close', e); }
        }
        
        setActiveLesson(null);
    };

    return (
        <div className="min-h-screen">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{
                        font-family: "Plus Jakarta Sans", sans-serif;
                    }
                `}
            </style>

            {/* Hero/Player Section */}
            <section className="relative min-h-[60vh] bg-slate-900 overflow-hidden">
                {activeLesson && isEnrolled ? (
                    <div className="px-6 md:px-12 lg:px-24 xl:px-40 py-12">
                        <SecurePlayer 
                            videoUrl={activeLesson.videoUrl} 
                            studentName={JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('user') || '{"name":"Student"}' : '{"name":"Student"}').name} 
                            studentPhone={JSON.parse(typeof localStorage !== 'undefined' ? localStorage.getItem('user') || '{"phone":""}' : '{"phone":""}').phone || "Student"}
                            maxViews={activeLesson.maxViews || 3}
                        />
                        <div className="mt-8 text-white flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black mb-2">{activeLesson.title}</h2>
                                <p className="text-slate-400">Currently playing lesson from {course.title}</p>
                            </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleCloseLesson}
                                className="bg-red-500/20 hover:bg-red-500/40 text-red-200 px-4 py-2 rounded-xl text-sm font-bold border border-red-500/20 transition-all flex items-center gap-2"
                            >
                                ✕ Close Lesson
                            </button>
                            {activeLesson.viewsRemaining !== undefined && (
                                <div className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold text-white border border-white/20">
                                    Views Remaining: <span className="text-emerald-400">{activeLesson.viewsRemaining}</span>
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <img src={course.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop'} alt={course.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end px-6 md:px-12 lg:px-24 xl:px-40 pb-16">
                            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
                                {course.level || "Grade 12"}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">{course.title}</h1>
                            <div className="flex items-center gap-6 text-white/80">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">I</span>
                                    <span className="font-bold">Eng:Mohamed Hanafy</span>
                                </div>
                                <div className="h-4 w-px bg-white/20"></div>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    ✓ Secure Content Protected
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <div className="px-6 md:px-12 lg:px-24 xl:px-40 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-3xl font-black text-slate-900 mb-6">About this Course</h2>
                        <p className="text-slate-600 text-lg leading-relaxed">{course.description}</p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black text-slate-900 mb-6">Course Curriculum</h2>
                        <div className="space-y-4">
                            {courseLessons.map((lesson, i) => (
                                <div 
                                    key={lesson.id} 
                                    onClick={() => handleLessonClick(lesson)}
                                    className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
                                        activeLesson?.id === lesson.id ? 'bg-blue-50 border-blue-200 shadow-lg' : 'bg-slate-50 border-slate-100 hover:border-blue-100'
                                    } ${!isEnrolled ? 'opacity-70 grayscale' : 'opacity-100'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${activeLesson?.id === lesson.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{lesson.title}</h4>
                                            {lesson.maxViews > 0 ? (
                                                <p className="text-xs text-blue-600 font-bold">{lesson.maxViews} Views Max</p>
                                            ) : (
                                                <p className="text-xs text-emerald-600 font-bold">Unlimited Views</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${isEnrolled ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {isEnrolled ? (
                                            <span className="text-xl">▶️</span>
                                        ) : (
                                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17a2 2 0 0 0 2-2V9a2 2 0 0 0-4 0v6a2 2 0 0 0 2 2zm6-9h-1V7a5 5 0 0 0-10 0v1H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3zM8 7a3 3 0 0 1 6 0v1H8V7zm11 13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9z"/></svg>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sticky Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl shadow-blue-900/5 space-y-8">
                        <div>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-2">Price</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl font-black text-slate-900">{(course.isFree || course.price == 0) ? 'Free' : `${course.price} EGP`}</span>
                                        {!(course.isFree || course.price == 0) && course.price > 0 && <span className="text-sm text-slate-400 line-through">199.99 EGP</span>}
                                    </div>
                        </div>

                        <div className="space-y-4">
                            {!(course.isFree || course.price == 0) && (
                                <div className="space-y-4 animate-fade-in-up">
                                    <button 
                                        onClick={() => setShowRedeemModal(true)}
                                        className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
                                    >
                                        Enroll with Code
                                    </button>
                                </div>
                            )}
                            {(course.isFree || course.price == 0) && (
                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center animate-zoom-in">
                                    <p className="text-emerald-600 font-bold text-sm">This course is currently FREE! ✓</p>
                                    <p className="text-slate-500 text-xs">Enjoy watching all lessons immediately.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-slate-50">
                            <h4 className="font-bold text-slate-900">This course includes:</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="text-blue-500 font-bold">✓</span> {course.lessonsCount} HD Video Lessons
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="text-red-500 font-bold">x</span> Downloadable Resources
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <span className="text-blue-500 font-bold">✓</span> Lifetime Access
                                </li>
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Redeem Modal */}
            {showRedeemModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowRedeemModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 text-2xl">×</button>
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto">🎫</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Redeem Code</h3>
                            <p className="text-slate-500 text-sm">Unlock <span className="font-bold text-blue-600">{course.title}</span></p>
                        </div>
                        <div className="space-y-6">
                            <input 
                                type="text"
                                value={redeemCode}
                                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE HERE"
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-center font-mono font-bold text-xl uppercase tracking-widest"
                            />
                            <button 
                                onClick={handleRedeem}
                                disabled={isSuccess}
                                className={`w-full py-5 rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {isSuccess ? 'Validated! ✓' : 'Activate Course'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
