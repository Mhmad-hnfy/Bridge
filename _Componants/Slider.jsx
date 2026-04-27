"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Slider = () => {
  const slides = [
    {
      image: "/math-hero.png",
      title: "Master Mathematics with Dr. Islam",
      description:
        "Unlock the secrets of Calculus, Algebra, and Geometry with expert guidance.",
    },
    {
      image: "/ninja-hero.png",
      title: "Your Path to Academic Excellence",
      description:
        "Join thousands of students who have mastered complex math concepts with ease.",
    },
    {
      image: "/dr-islam.jpg",
      title: "Experience the Best Learning",
      description:
        "Specialized math curriculum designed for high school and university levels.",
    },
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[450px] md:h-[600px] overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent flex flex-col justify-center items-start px-12 md:px-24 lg:px-40">
            <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4 bg-blue-400/10 px-4 py-1 rounded-full backdrop-blur-sm">
              Premium Math Education
            </span>
            <h2 className="text-white text-4xl md:text-7xl font-extrabold mb-6 max-w-2xl leading-tight">
              {slide.title}
            </h2>
            <p className="text-slate-200 text-lg md:text-2xl max-w-xl mb-10 leading-relaxed">
              {slide.description}
            </p>
            <div className="flex gap-4">
              <Link
                href="/signup"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1"
              >
                Start Learning
              </Link>
              <Link
                href="#courses"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
              >
                View Courses
              </Link>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-12 md:left-24 lg:left-40 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-1.5 transition-all rounded-full ${
              index === current ? "bg-blue-500 w-12" : "bg-white/30 w-6"
            }`}
          />
        ))}
      </div>

      <button
        onClick={() =>
          setCurrent(current === 0 ? slides.length - 1 : current - 1)
        }
        className="absolute right-24 bottom-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={() =>
          setCurrent(current === slides.length - 1 ? 0 : current + 1)
        }
        className="absolute right-8 bottom-8 p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

export default Slider;
