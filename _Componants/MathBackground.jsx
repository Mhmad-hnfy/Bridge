"use client";
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const mathChars = ['Σ', 'π', '∞', '√', '∫', 'Δ', 'θ', 'λ', 'μ', 'Ω', '±', '≠', '≈', '≤', '≥', 'x²', 'y³', 'sin', 'cos', 'tan', 'log', 'exp', 'f(x)'];

export default function MathBackground() {
    const pathname = usePathname();
    const [symbols, setSymbols] = useState([]);
    
    useEffect(() => {
        const initialSymbols = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            char: mathChars[Math.floor(Math.random() * mathChars.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: `${Math.random() * 15 + 15}px`, // Very small for a subtle pattern effect
            duration: `${Math.random() * 30 + 20}s`,
            delay: `${Math.random() * 20}s`,
        }));
        setSymbols(initialSymbols);
    }, []);

    // Hide on admin pages - moved after hooks to fix React error
    if (pathname?.startsWith('/admin')) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <style>
                {`
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    20% { opacity: 0.15; }
                    80% { opacity: 0.15; }
                    100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
                }
                .math-symbol {
                    position: absolute;
                    font-family: 'serif';
                    font-weight: 900;
                    animation: float linear infinite;
                    user-select: none;
                }
                `}
            </style>
            {symbols.map((s) => (
                <div
                    key={s.id}
                    className="math-symbol text-blue-600" // Vibrant blue
                    style={{
                        left: s.left,
                        top: s.top,
                        fontSize: s.size,
                        opacity: 0.15, // Fixed higher opacity
                        animationDuration: s.duration,
                        animationDelay: s.delay,
                    }}
                >
                    {s.char}
                </div>
            ))}
        </div>
    );
}
