import { useEffect, useState } from 'react';

export const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', isDark.toString());
    }, [isDark]);

    const toggle = () => setIsDark(!isDark);

    return { isDark, toggle };
};
