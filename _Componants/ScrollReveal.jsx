"use client";
import { useEffect } from 'react';

export default function ScrollReveal() {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        }, { threshold: 0.1 });

        const observeElements = () => {
            document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
        };

        observeElements();
        
        // Re-observe on dynamic content changes
        const mutationObserver = new MutationObserver(observeElements);
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    return null;
}
