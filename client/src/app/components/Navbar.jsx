import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const readUser = useCallback(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        readUser();

        const handleStorageChange = () => readUser();
        const handleAuthChange = () => readUser();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('auth-change', handleAuthChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, [readUser]);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    const toggleMenu = useCallback(() => {
        setMenuOpen(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
    }, []);

    const navLinks = {
        student: [
            { to: '/dashboard/student', icon: 'fa-th-large', label: 'Dashboard' },
            { to: '/exams', icon: 'fa-file-alt', label: 'My Exams' },
            { to: '/exams/upcoming', icon: 'fa-calendar-alt', label: 'Upcoming', badge: '2' },
            { to: '/results', icon: 'fa-chart-bar', label: 'Results' },
            { to: '/profile', icon: 'fa-user-graduate', label: 'Profile' },
        ],
        instructor: [
            { to: '/dashboard/instructor?tab=overview', icon: 'fa-th-large', label: 'Dashboard' },
            { to: '/dashboard/instructor?tab=exams', icon: 'fa-tasks', label: 'Manage Exams' },
            { to: '/dashboard/instructor?tab=courses', icon: 'fa-book-open', label: 'Courses' },
            { to: '/students', icon: 'fa-users', label: 'Students' },
            { to: '/results/review', icon: 'fa-clipboard-check', label: 'Review' },
        ],
        admin: [
            { to: '/dashboard/admin?tab=overview', icon: 'fa-th-large', label: 'Dashboard' },
            { to: '/dashboard/admin?tab=users', icon: 'fa-user-shield', label: 'Users' },
            { to: '/dashboard/admin?tab=exams', icon: 'fa-file-alt', label: 'Exams' },
            { to: '/dashboard/admin?tab=courses', icon: 'fa-book-open', label: 'Courses' },
        ],
    };

    const links = navLinks[user?.role] || [];

    if (!user) return null;

    return (
        <>
            <div
                className={`${styles.overlay} ${menuOpen ? styles.visible : ''}`}
                onClick={closeMenu}
                aria-hidden="true"
            />
            <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
                <button
                    className={styles.hamburger}
                    onClick={toggleMenu}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                    aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                >
                    <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
                </button>
                <ul
                    id="main-navigation"
                    className={`${styles.navList} ${menuOpen ? styles.open : ''}`}
                    role="menubar"
                >
                    {links.map((link) => (
                        <li key={link.to} className={styles.navItem} role="none">
                            <NavLink
                                to={link.to}
                                end={link.to === `/dashboard/${user?.role}`}
                                className={({ isActive }) =>
                                    `${styles.navLink} ${isActive ? styles.active : ''}`
                                }
                                role="menuitem"
                                tabIndex={menuOpen ? 0 : undefined}
                            >
                                <i className={`fas ${link.icon} ${styles.navIcon}`} aria-hidden="true"></i>
                                <span>{link.label}</span>
                                {link.badge && (
                                    <span className={styles.badge} aria-label={`${link.badge} items`}>
                                        {link.badge}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};

export default Navbar;