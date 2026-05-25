"use client";
import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{
                        font-family: "Plus Jakarta Sans", sans-serif;
                    }
                `}
            </style>
            
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Branding/Image */}
                <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <Link href="/" className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-black text-xl">
                                Σ
                            </div>
                            <span className="text-2xl font-black tracking-tight">ENG:MOHAMED HANAFY</span>
                        </Link>
                        
                        <h2 className="text-4xl font-black leading-tight mb-6">
                            Welcome Back to the <span className="text-blue-200">Math Mastery</span> Portal.
                        </h2>
                        <p className="text-blue-100 text-lg leading-relaxed opacity-90">
                            Log in to access your dashboard, resume your lessons, and track your progress toward excellence.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12">
                        <div className="flex -space-x-4 mb-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-600 bg-slate-200 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="student" />
                                </div>
                            ))}
                            <div className="w-10 h-10 rounded-full border-2 border-blue-600 bg-blue-500 flex items-center justify-center text-[10px] font-bold">
                                +2k
                            </div>
                        </div>
                        <p className="text-sm font-medium text-blue-100">Join 2,000+ students learning today.</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
                    <div className="mb-10">
                        <h3 className="text-3xl font-black text-slate-900 mb-2">Sign In</h3>
                        <p className="text-slate-500">Enter your credentials to access your account</p>
                    </div>

                    <form className="space-y-6" onSubmit={async (e) => {
                        e.preventDefault();
                        const email = e.target.email.value;
                        const password = e.target.password.value;
                        
                        const res = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, password })
                        });

                        const data = await res.json();
                        if (res.ok) {
                            localStorage.setItem('user', JSON.stringify(data.user));
                            localStorage.setItem('role', data.role);
                            if (data.role === 'admin') {
                                window.location.href = '/admin/dashboard';
                            } else {
                                window.location.href = '/dashboard';
                            }
                        } else {
                            alert(data.error || 'Login failed');
                        }
                    }}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="name@example.com"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-700">Password</label>
                                <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">Forgot?</a>
                            </div>
                            <input 
                                type="password" 
                                name="password"
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900"
                                required
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="remember" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="remember" className="text-sm font-medium text-slate-600">Remember me for 30 days</label>
                        </div>

                        <button type="submit" className="w-full py-4 px-6 rounded-2xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98] mb-6">
                            Sign In
                        </button>

                    </form>

                    <p className="mt-10 text-center text-slate-500">
                        Don't have an account? <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
