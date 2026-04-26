import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faFileAlt, faShieldHalved, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        abortRef.current = new AbortController();

        try {
            const statsRes = await apiClient.get('/api/admin/stats', { signal: abortRef.current.signal });
            if (statsRes.data.success) setStats(statsRes.data.data.stats);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData]);

    const firstName = user?.first_name || 'Admin';

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                <span>Loading admin panel...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorState}>
                <FontAwesomeIcon icon={faTriangleExclamation} className={styles.errorIcon} />
                <span>{error}</span>
                <button className={styles.retryBtn} onClick={fetchData}>Retry</button>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Admin Panel — {firstName}</h1>
                <p className={styles.subtitle}>Full system overview and management.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.users ?? '—'}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.courses ?? '—'}</span>
                        <span className={styles.statLabel}>Courses</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.exams ?? '—'}</span>
                        <span className={styles.statLabel}>Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{stats?.instructors ?? '—'}</span>
                        <span className={styles.statLabel}>Instructors</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Quick Management</h2>
                </div>
                <div className={styles.cardGrid}>
                    <Link to="/users/manage" className={styles.infoCard} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.infoCardTitle}>User Management</h3>
                        <p className={styles.infoCardDesc}>Manage students, instructors, and admin accounts.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeBlue}`}>{stats?.users ?? '—'} users</span>
                        </div>
                    </Link>
                    <Link to="/courses" className={styles.infoCard} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.infoCardTitle}>Course Management</h3>
                        <p className={styles.infoCardDesc}>Create and manage course catalog.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeGreen}`}>{stats?.courses ?? '—'} courses</span>
                        </div>
                    </Link>
                    <Link to="/categories" className={styles.infoCard} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.infoCardTitle}>Categories & Exams</h3>
                        <p className={styles.infoCardDesc}>Organize exams with categories and tags.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeAmber}`}>{stats?.exams ?? '—'} exams</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;