import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Header.module.css';
import logoImage from '../../assets/sutech-logo.png';

const Header = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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

    const handleLogout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <header className={styles.header} role="banner">
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

            <div className={styles.headerRight}>
                {user ? (
                    <>
                        <div className={styles.headerActions}>
                            <button className={styles.iconBtn} aria-label="Notifications" title="Notifications">
                                <i className="fas fa-bell" aria-hidden="true"></i>
                                <span className={styles.notificationDot}></span>
                            </button>
                            <button className={styles.iconBtn} aria-label="Messages" title="Messages">
                                <i className="fas fa-envelope" aria-hidden="true"></i>
                            </button>
                        </div>
                        <div className={styles.userInfo} title={`${user.first_name} ${user.last_name}`}>
                            <div className={styles.avatar} aria-hidden="true">
                                {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className={styles.userDetails}>
                                <div className={styles.userName}>
                                    {user.first_name} {user.last_name}
                                </div>
                                <div className={styles.userRole}>{user.role}</div>
                            </div>
                        </div>
                        <button
                            className={styles.logoutBtn}
                            onClick={handleLogout}
                            aria-label="Logout"
                        >
                            <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <button
                        className={styles.authBtn}
                        onClick={() => navigate('/auth')}
                    >
                        <i className="fas fa-sign-in-alt" aria-hidden="true"></i>
                        <span>Login / Register</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;