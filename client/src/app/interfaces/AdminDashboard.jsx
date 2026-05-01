import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faFileAlt, faShieldHalved, faSpinner, faSyncAlt, faUserGraduate, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';
import adminStyles from '../styles/AdminDashboard.module.css';
import UserManagement from '../components/admin/UserManagement.jsx';
import ExamManagement from '../components/admin/ExamManagement.jsx';
import CourseManagement from '../components/admin/CourseManagement.jsx';

function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ users: 0, students: 0, instructors: 0, exams: 0, courses: 0 });
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [loading, setLoading] = useState(true);
    const abortRef = useRef(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/admin/stats', { signal: abortRef.current.signal });
            if (res.data.success) setStats(res.data.data.stats);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        }
        fetchStats();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchStats]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'users', 'exams', 'courses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'overview' ? {} : { tab });
    };

    const firstName = user?.first_name || 'Admin';

    const tabs = [
        { key: 'overview', label: 'Overview', icon: faShieldHalved },
        { key: 'users', label: 'Users', icon: faUsers },
        { key: 'exams', label: 'Exams', icon: faFileAlt },
        { key: 'courses', label: 'Courses', icon: faBookOpen },
    ];

    if (loading) {
        return (
            <div className={adminStyles.centerState}>
                <FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} />
                <span>Loading admin panel...</span>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Admin Panel — {firstName}</h1>
                <p className={styles.subtitle}>
                    Full system control &mdash;{' '}
                    <button className={adminStyles.refreshBtn} onClick={fetchStats}>
                        <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Refresh Stats
                    </button>
                </p>
            </div>

            <div className={adminStyles.tabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`${adminStyles.tab} ${activeTab === tab.key ? adminStyles.tabActive : ''}`}
                        onClick={() => handleTabChange(tab.key)}
                    >
                        <FontAwesomeIcon icon={tab.icon} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.users}</span>
                            <span className={styles.statLabel}>Total Users</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <FontAwesomeIcon icon={faUserGraduate} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.students}</span>
                            <span className={styles.statLabel}>Students</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <FontAwesomeIcon icon={faChalkboardTeacher} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.instructors}</span>
                            <span className={styles.statLabel}>Instructors</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.exams}</span>
                            <span className={styles.statLabel}>Exams</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && <UserManagement onStatsChange={fetchStats} />}
            {activeTab === 'exams' && <ExamManagement />}
            {activeTab === 'courses' && <CourseManagement />}
        </div>
    );
}

export default AdminDashboard;