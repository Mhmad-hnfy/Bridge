"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const userRole = localStorage.getItem('role');
        if (userStr) setUser(JSON.parse(userStr));
        if (userRole) setRole(userRole);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Courses', href: '/courses' }
    ];
    if (user) {
        navItems.push({ name: 'Dashboard', href: role === 'admin' ? '/admin/dashboard' : '/dashboard' });
    }

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{ font-family: "Plus Jakarta Sans", sans-serif; }
                `}
            </style>
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-6 md:px-12 lg:px-24 xl:px-40 py-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">
                            Σ
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">DR. <span className="text-blue-600">ISLAM</span></span>
                    </Link>
                </div>

                <div className="hidden lg:flex items-center gap-1">
                    {navItems.map((item) => (
                        <Link key={item.name} href={item.href} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-slate-900 leading-tight">{user.name}</span>
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</span>
                            </div>
                            <button 
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-50 text-red-500 text-xs font-black rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-3">
                            <Link href="/login" className="px-5 py-2.5 text-slate-600 font-bold text-sm hover:text-blue-600 transition-colors">
                                Log In
                            </Link>
                            <Link href="/signup" className="bg-slate-900 text-white hover:bg-blue-600 text-sm font-bold px-6 py-3 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                                Join Now
                            </Link>
                        </div>
                    )}
                    
                    <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden flex flex-col gap-1.5 cursor-pointer bg-slate-100 p-3 rounded-xl border-0">
                        <span className={`block w-6 h-0.5 bg-slate-800 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-slate-800 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-6 h-0.5 bg-slate-800 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>

                {menuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white border-t border-slate-100 flex flex-col p-6 gap-2 lg:hidden shadow-2xl animate-in slide-in-from-top duration-300">
                        {navItems.map((item) => (
                            <Link key={item.name} href={item.href} className="px-5 py-4 rounded-2xl text-base font-bold text-slate-600 hover:bg-slate-50">
                                {item.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-slate-50">
                            {user ? (
                                <button onClick={handleLogout} className="w-full py-4 text-center bg-red-50 text-red-500 font-bold rounded-2xl">
                                    Logout
                                </button>
                            ) : (
                                <>
                                    <Link href="/login" className="w-full py-4 text-center text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all">
                                        Log In
                                    </Link>
                                    <Link href="/signup" className="w-full py-4 text-center bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    )
}

export default Header;