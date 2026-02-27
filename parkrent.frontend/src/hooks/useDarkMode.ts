import { useEffect, useState } from 'react';
import { getDarkMode, setDarkMode as saveDarkMode } from '../api/userSettings';

export const useDarkMode = () => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getDarkMode()
                .then(dark => {
                    setIsDark(dark);
                    localStorage.setItem('darkMode', dark.toString());
                })
                .catch(() => {
                });
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark-mode');
        } else {
            root.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', isDark.toString());
    }, [isDark]);

    const toggle = async () => {
        const newValue = !isDark;
        setIsDark(newValue);

        const token = localStorage.getItem('token');
        if (token) {
            try {
                await saveDarkMode(newValue);
            } catch {

            }
        }
    };

    return { isDark, toggle };
};
