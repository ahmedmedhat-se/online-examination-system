import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faFileAlt, faSpinner, faSyncAlt, faClock, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';
import adminStyles from '../styles/AdminDashboard.module.css';
import ExamManagement from '../components/admin/ExamManagement.jsx';
import CourseManagement from '../components/admin/CourseManagement.jsx';

function InstructorDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalExams: 0, totalCourses: 0, published: 0, drafts: 0 });
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        try {
            const [examsRes, coursesRes] = await Promise.all([
                apiClient.get('/api/instructor/exams', { signal: abortRef.current.signal }),
                apiClient.get('/api/instructor/courses', { signal: abortRef.current.signal }),
            ]);

            const exams = examsRes.data.success ? examsRes.data.data.exams || [] : [];
            const courses = coursesRes.data.success ? coursesRes.data.data.courses || [] : [];

            setStats({
                totalExams: exams.length,
                totalCourses: courses.length,
                published: exams.filter(e => e.is_published).length,
                drafts: exams.filter(e => !e.is_published).length,
            });
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try { setUser(JSON.parse(stored)); } catch { setUser(null); }
        }
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'exams', 'courses'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchParams(tab === 'overview' ? {} : { tab });
    };

    const firstName = user?.first_name || 'Instructor';

    const tabs = [
        { key: 'overview', label: 'Overview', icon: faClipboardCheck },
        { key: 'exams', label: 'Exams', icon: faFileAlt },
        { key: 'courses', label: 'Courses', icon: faBookOpen },
    ];

    if (loading) {
        return (
            <div className={adminStyles.centerState}>
                <FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} />
                <span>Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Welcome, Dr. {firstName}!</h1>
                <p className={styles.subtitle}>
                    Manage your exams and courses &mdash;{' '}
                    <button className={adminStyles.refreshBtn} onClick={fetchData}>
                        <FontAwesomeIcon icon={faSyncAlt} spin={loading} /> Refresh
                    </button>
                </p>
            </div>

            {error && <div className={adminStyles.toast}>{error}</div>}

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
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalExams}</span>
                            <span className={styles.statLabel}>Total Exams</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                            <FontAwesomeIcon icon={faBookOpen} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.totalCourses}</span>
                            <span className={styles.statLabel}>Courses</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                            <FontAwesomeIcon icon={faUsers} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.published}</span>
                            <span className={styles.statLabel}>Published</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                            <FontAwesomeIcon icon={faClock} />
                        </div>
                        <div className={styles.statContent}>
                            <span className={styles.statValue}>{stats.drafts}</span>
                            <span className={styles.statLabel}>Drafts</span>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'exams' && <ExamManagement />}
            {activeTab === 'courses' && <CourseManagement />}
        </div>
    );
}

export default InstructorDashboard;