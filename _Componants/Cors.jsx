"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Cors() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <section className="py-24 text-center">
            <div className="animate-spin text-4xl mb-4">⌛</div>
            <p className="text-slate-500">Loading Courses...</p>
        </section>
    );

    const allCourses = courses;

    return (
        <section id="courses" className="py-24 px-6 md:px-12 lg:px-24 xl:px-40">
            <div className="flex flex-col items-center mb-16">
                <div className="bg-blue-100 text-blue-600 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4">
                    Expert Guidance
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 text-center mb-4">Mathematics Curriculum</h2>
                <p className="text-slate-500 text-center max-w-2xl text-lg">
                    Join Dr. Islam's specialized courses designed to simplify complex math.
                </p>
                <div className="w-24 h-1.5 bg-blue-600 mt-8 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {allCourses.map((course) => (
                    <div 
                        key={course.id} 
                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 flex flex-col group"
                    >
                        <div className="relative overflow-hidden aspect-[16/10]">
                            <img 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                src={course.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400&auto=format&fit=crop'}
                                alt={course.title} 
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-4 py-2 rounded-2xl">
                                {course.category}
                            </div>
                        </div>
                        
                        <div className="p-8 flex flex-col flex-grow">
                            <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 line-clamp-2">
                                {course.description}
                            </p>
                            
                            <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col gap-3">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black text-slate-900">{course.price > 0 ? `${course.price} EGP` : 'Free'}</span>
                                    </div>
                                    <span className="text-slate-400 text-sm">{course.lessons?.length || 0} Lessons</span>
                                </div>
                                <Link 
                                    href={`/course/${course.id}`}
                                    className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 text-center block"
                                >
                                    Enroll with Code
                                </Link>
                                <Link href="/signup" className="w-full py-3 text-center text-slate-500 text-sm font-bold hover:text-slate-900 transition-colors">
                                    Or Pay Online
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Remove the modal from here since it's now on the detail page */}
        </section>
    );
};