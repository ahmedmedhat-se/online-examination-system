import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faSignOutAlt, faSignInAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Header.module.css';
import logoImage from '../../assets/sutech-logo.png';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }

        const handleStorageChange = () => {
            const updated = localStorage.getItem('user');
            if (updated) {
                try {
                    setUser(JSON.parse(updated));
                } catch {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(`.${styles.userMenu}`)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setDropdownOpen(false);
        window.dispatchEvent(new Event('auth-change'));
        navigate('/', { replace: true });
    }, [navigate]);

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const userNavLinks = [
        { to: '/', label: 'Home', end: true },
        { to: '/dashboard/student?tab=overview', label: 'Dashboard' },
        { to: '/dashboard/student?tab=exams', label: 'Exams' },
    ];

    const adminNavLinks = [
        { to: '/', label: 'Home', end: true },
        { to: '/dashboard/admin?tab=overview', label: 'Dashboard' },
        { to: '/dashboard/admin?tab=users', label: 'Users' },
        { to: '/dashboard/admin?tab=courses', label: 'Courses' },
    ];

    const instructorNavLinks = [
        { to: '/', label: 'Home', end: true },
        { to: '/dashboard/instructor?tab=overview', label: 'Dashboard' },
        { to: '/dashboard/instructor?tab=exams', label: 'Manage Exams' },
        { to: '/dashboard/instructor?tab=students', label: 'Students' },
    ];

    const navLinks = user?.role === 'admin'
        ? adminNavLinks
        : user?.role === 'instructor'
            ? instructorNavLinks
            : userNavLinks;

    return (
        <header className={styles.header} role="banner">
            <div className={styles.headerLeft}>
                <Link to="/" className={styles.brand} aria-label="Exam Hub Home">
                    <img
                        src={logoImage}
                        alt="Exam Hub Logo"
                        className={styles.logoImage}
                    />
                    <div className={styles.brandInfo}>
                        <span className={styles.brandName}>Exam Hub</span>
                        <span className={styles.brandTagline}>Online Examination</span>
                    </div>
                </Link>

                {user && (
                    <nav className={styles.headerNav} aria-label="Primary navigation">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) =>
                                    `${styles.headerNavLink} ${isActive ? styles.headerNavLinkActive : ''}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                )}
            </div>

            <div className={styles.headerRight}>
                {user ? (
                    <>
                        <button className={styles.iconBtn} aria-label="Notifications">
                            <FontAwesomeIcon icon={faBell} />
                            <span className={styles.notificationDot}></span>
                        </button>
                        <button className={styles.iconBtn} aria-label="Messages">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </button>

                        <div className={styles.userMenu}>
                            <button
                                className={styles.userTrigger}
                                onClick={() => setDropdownOpen(prev => !prev)}
                                aria-expanded={dropdownOpen}
                                aria-haspopup="true"
                            >
                                <div className={styles.avatar}>
                                    {getInitials(user.first_name, user.last_name)}
                                </div>
                                <div className={styles.userDetails}>
                                    <span className={styles.userName}>
                                        {user.first_name} {user.last_name}
                                    </span>
                                    <span className={styles.userRole}>{user.role}</span>
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} className={styles.chevron} />
                            </button>

                            {dropdownOpen && (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <div className={styles.dropdownAvatar}>
                                            {getInitials(user.first_name, user.last_name)}
                                        </div>
                                        <div>
                                            <div className={styles.dropdownName}>
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className={styles.dropdownEmail}>{user.email}</div>
                                        </div>
                                    </div>
                                    <div className={styles.dropdownDivider}></div>
                                    <Link to="/dashboard/student?tab=overview" className={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                                        <i className="fas fa-user-circle"></i>
                                        My Profile
                                    </Link>
                                    <div className={styles.dropdownDivider}></div>
                                    <button className={styles.dropdownItem} onClick={handleLogout}>
                                        <FontAwesomeIcon icon={faSignOutAlt} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button className={styles.authBtn} onClick={() => navigate('/auth')}>
                        <FontAwesomeIcon icon={faSignInAlt} />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;