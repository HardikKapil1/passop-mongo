

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const nav = useNavigate();
    const [dark, setDark] = useState(() => {
        try {
            return localStorage.getItem('dark') === 'true';
        } catch { return false }
    });

    useEffect(() => {
        try {
            if (dark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
            localStorage.setItem('dark', dark ? 'true' : 'false');
        } catch (e) {
            // ignore
        }
    }, [dark]);

    const handleSignOut = () => {
        try { localStorage.removeItem('token'); } catch {}
        nav('/login');
    }

    return (
        <nav className='bg-white dark:bg-slate-900 text-black dark:text-white'>
            <div className="mycontainer flex justify-between items-center px-4 py-3 h-14">

                <div className="logo font-bold text-2xl">
                    <span className='text-green-500'> &lt;</span>
                    <span>Pass</span><span className='text-green-500'>OP/&gt;</span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDark(d => !d)}
                        aria-label="Toggle dark mode"
                        className="px-3 py-1 rounded-md border dark:border-slate-700"
                    >
                        {dark ? '🌙' : '☀️'}
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="px-3 py-1 bg-red-500 text-white rounded-md"
                        aria-label="Sign out"
                    >
                        Sign out
                    </button>

                    <a className='hidden md:inline-flex text-sm text-green-600 ml-2' href="https://github.com/HardikKapil1/passop-mongo">GitHub</a>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
