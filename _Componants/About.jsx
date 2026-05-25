"use client";
import Link from 'next/link';
import React from 'react';

const AboutEngMohamedHanafy = () => {
    return (
        <section className="py-24 px-6 md:px-12 lg:px-24 xl:px-40">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative group scroll-reveal">
                    <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-2xl group-hover:bg-blue-600/20 transition-all duration-500"></div>
                    <div className="relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[2.5rem] shadow-2xl border-8 border-white">
                        <img 
                            src="/Hanafy.jpg" 
                            alt="Eng: Mohamed Hanafy - Math Expert" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 hidden md:block">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                                π
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">10+</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Years Experience</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -top-6 -left-6 bg-blue-600 p-6 rounded-3xl shadow-xl hidden md:block">
                        <p className="text-white text-center">
                            <span className="block text-3xl font-black">5000+</span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Students Guided</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col scroll-reveal" style={{ transitionDelay: '200ms' }}>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 w-fit">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Meet Your Instructor
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
                        The Secret to <span className="text-blue-600 italic">Perfect</span> Math Scores
                    </h2>
                    
                    <p className="text-slate-600 text-lg md:text-xl leading-relaxed mb-8">
                        Eng: Mohamed Hanafy is not just a teacher; he's a mentor dedicated to simplifying the most complex mathematical theories. With a unique methodology that focuses on conceptual clarity, he has helped thousands of students overcome their math phobias and excel in their academic journey.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="flex items-start gap-4">
                            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600 mt-1">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Simplified Methods</h4>
                                <p className="text-sm text-slate-500">Complex problems solved in simple steps.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600 mt-1">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Interactive Sessions</h4>
                                <p className="text-sm text-slate-500">Real-time Q&A and problem solving.</p>
                            </div>
                        </div>
                    </div>
                    <Link href="/signup">
                        <button className="w-fit px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1 active:scale-95 flex items-center gap-3">
                            Join My Academy
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default AboutEngMohamedHanafy;
