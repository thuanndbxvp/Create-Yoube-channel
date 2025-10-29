import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PaletteIcon } from './icons';
import { Theme } from '../types';

const THEME_NAMES: Record<Theme, string> = {
    sky: 'Xanh lam',
    green: 'Xanh lục',
    yellow: 'Vàng',
    red: 'Đỏ',
    purple: 'Tím',
    orange: 'Da cam',
};

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex-shrink-0 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-slate-200 p-2.5 rounded-lg transition-colors duration-200"
                title="Chọn chủ đề"
            >
                <PaletteIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 p-2">
                    <div className="grid grid-cols-3 gap-2">
                        {Object.keys(themes).map((themeKey) => {
                            const currentTheme = themes[themeKey as Theme];
                            const isActive = theme === themeKey;
                            return (
                                <div key={themeKey} className="flex flex-col items-center">
                                    <button
                                        onClick={() => {
                                            setTheme(themeKey as Theme);
                                            setIsOpen(false);
                                        }}
                                        className={`w-10 h-10 rounded-full transition-transform transform hover:scale-110 focus:outline-none ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''}`}
                                        style={{ backgroundColor: currentTheme['--color-primary-500'] }}
                                        title={THEME_NAMES[themeKey as Theme]}
                                    />
                                     <span className={`mt-1 text-xs ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                        {THEME_NAMES[themeKey as Theme]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
