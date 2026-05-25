"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [myCourses, setMyCourses] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [redeemCode, setRedeemCode] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        
        if (!storedUser || role !== 'student') {
            window.location.href = '/login';
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchData(parsedUser.id);
    }, []);

    const fetchData = async (studentId) => {
        try {
            // Fetch student profile to get unlocked courses and level
            const profileRes = await fetch(`/api/students/profile?id=${studentId}`);
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profile = await profileRes.json();
            
            // Fetch all courses
            const coursesRes = await fetch('/api/courses');
            const allCourses = await coursesRes.json();

            // Filter courses
            let unlockedIds = [];
            try { unlockedIds = JSON.parse(profile.unlockedCourses || '[]'); } catch(e){}

            const unlocked = allCourses.filter(c => unlockedIds.includes(c.id));
            const available = allCourses.filter(c => !unlockedIds.includes(c.id) && c.level === profile.level);

            setMyCourses(unlocked);
            setAvailableCourses(available);
            setLoading(false);
        } catch (error) {
            console.error('Dashboard load error:', error);
            setLoading(false);
        }
    };

    const handleRedeem = async () => {
        if (!redeemCode) return alert('Please enter a code');
        
        const res = await fetch('/api/codes/redeem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: redeemCode, studentId: user.id })
        });

        if (res.ok) {
            const data = await res.json();
            setIsSuccess(true);
            
            // Update local user data immediately
            const updatedUser = { 
                ...user, 
                unlockedCourses: data.unlockedCourses 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setTimeout(() => {
                setIsSuccess(false);
                setRedeemCode('');
                fetchData(user.id); // Refresh courses list
            }, 2000);
        } else {
            const err = await res.json();
            alert(err.error || 'Invalid or already used code.');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400">Loading your academy...</div>;

    return (
        <div className="min-h-screen">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{ font-family: "Plus Jakarta Sans", sans-serif; }
                `}
            </style>

            <header className="bg-slate-900 text-white pt-24 pb-32 px-6 lg:px-24 rounded-b-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)]"></div>
                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2">Welcome back, {user?.name.split(' ')[0]} 👋</h1>
                        <p className="text-slate-400">Ready to conquer mathematics today?</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-4 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Enter Activation Code"
                            value={redeemCode}
                            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                            className="bg-black/20 text-white px-4 py-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 font-mono w-full md:w-64 uppercase"
                        />
                        <button 
                            onClick={handleRedeem}
                            disabled={isSuccess}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${isSuccess ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}
                        >
                            {isSuccess ? 'Unlocked!' : 'Redeem'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 lg:px-24 -mt-16 relative z-20 space-y-16 pb-24">
                
                {/* My Courses */}
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">🎓</div>
                        <h2 className="text-3xl font-black text-slate-900">My Learning</h2>
                    </div>
                    
                    {myCourses.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No courses unlocked yet</h3>
                            <p className="text-slate-500 max-w-md mx-auto">Use an activation code from Eng:Mohamed Hanafy to unlock your courses and start learning.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {myCourses.map(course => (
                                <Link href={`/course/${course.id}`} key={course.id} className="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all block">
                                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6 relative">
                                        <img src={course.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors"></div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600">Active</div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{course.title}</h3>
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                        <span className="text-blue-500">▶</span> Continue Watching
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Available Courses */}
                {availableCourses.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-xl">✨</div>
                            <h2 className="text-3xl font-black text-slate-900">Recommended for You</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {availableCourses.map(course => (
                                <div key={course.id} className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex flex-col">
                                    <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                                        <img src={course.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'} className="w-full h-full object-cover grayscale opacity-80" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{course.title}</h3>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">{course.description}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <span className="font-black text-slate-900">{course.price > 0 ? `${course.price} EGP` : 'Free'}</span>
                                        <Link href={`/course/${course.id}`} className="text-sm font-bold text-blue-600 hover:underline">View Details</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
