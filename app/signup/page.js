"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SignupPage() {
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        confirmPassword: '',
        phone: '', 
        level: '' 
    });
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/levels')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLevels(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, level: data[0].name }));
                    }
                } else {
                    setLevels([]);
                }
            })
            .catch(() => setLevels([]));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.level) {
            return alert('No educational levels available. Please contact admin.');
        }

        if (formData.password !== formData.confirmPassword) {
            return alert('Passwords do not match!');
        }

        setLoading(true);
        const res = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                level: formData.level
            })
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', 'student');
            alert('Welcome! Your account has been created.');
            window.location.href = '/dashboard';
        } else {
            alert(data.error || 'Signup failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 py-12">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap');
                    *{ font-family: "Plus Jakarta Sans", sans-serif; }
                `}
            </style>
            
            <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl p-10">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-lg shadow-blue-600/20">Σ</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">Join the Academy</h2>
                    <p className="text-slate-500">Create your account to start learning</p>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="e.g. Ahmed Mohamed"
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            required
                            placeholder="name@example.com"
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
                        <input 
                            type="tel" 
                            required
                            placeholder="01xxxxxxxxx"
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Academic Level</label>
                        <select 
                            required
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                            value={formData.level}
                        >
                            {levels.length === 0 ? (
                                <option disabled>No levels added by admin</option>
                            ) : (
                                levels.map(lvl => (
                                    <option key={lvl.id} value={lvl.name}>{lvl.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                    </div>

                    <div className="md:col-span-2 pt-4">
                        <button 
                            type="submit" 
                            disabled={loading || levels.length === 0}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="mt-8 text-center text-slate-500 text-sm">
                    Already have an account? <Link href="/login" className="font-bold text-blue-600 hover:underline">Log In</Link>
                </p>
            </div>
        </div>
    );
}
