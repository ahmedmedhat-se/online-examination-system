import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faClock, faCheckCircle, faChartLine, faArrowRight, faCalendarAlt, faSpinner, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';

function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        abortRef.current = new AbortController();

        try {
            const [profileRes, enrollmentsRes, attemptsRes] = await Promise.all([
                apiClient.get('/api/v1/student/profile', { signal: abortRef.current.signal }),
                apiClient.get('/api/v1/student/enrollments', { signal: abortRef.current.signal }),
                apiClient.get('/api/v1/student/attempts', { signal: abortRef.current.signal }),
            ]);

            if (profileRes.data.success) setProfile(profileRes.data.data.student);
            if (enrollmentsRes.data.success) setEnrollments(enrollmentsRes.data.data.enrollments || []);
            if (attemptsRes.data.success) setAttempts(attemptsRes.data.data.attempts || []);
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

    const firstName = user?.first_name || profile?.first_name || 'Student';

    const enrolledCount = enrollments.length;
    const upcomingCount = enrollments.filter(e => new Date(e.start_time) > new Date()).length;
    const completedCount = attempts.filter(a => a.end_time).length;
    const avgScore = attempts.length > 0
        ? Math.round(attempts.filter(a => a.score != null).reduce((sum, a) => sum + Number(a.score), 0) / attempts.filter(a => a.score != null).length)
        : 0;
    const passedCount = attempts.filter(a => (a.score || 0) >= (a.passing_marks || 0)).length;

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.loadingIcon} />
                <span>Loading your dashboard...</span>
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
                <h1 className={styles.greeting}>Welcome back, {firstName}!</h1>
                <p className={styles.subtitle}>Here&apos;s your exam overview.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{enrolledCount}</span>
                        <span className={styles.statLabel}>Enrolled Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{upcomingCount}</span>
                        <span className={styles.statLabel}>Upcoming</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{avgScore > 0 ? `${avgScore}%` : '—'}</span>
                        <span className={styles.statLabel}>Avg Score</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>{passedCount}/{completedCount}</span>
                        <span className={styles.statLabel}>Passed</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Upcoming Exams</h2>
                    <Link to="/dashboard/student?tab=exams" className={styles.sectionLink}>
                        View All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                {enrollments.filter(e => new Date(e.start_time) > new Date()).length === 0 ? (
                    <div className={styles.emptyState}>No upcoming exams. You&apos;re all caught up!</div>
                ) : (
                    <div className={styles.cardGrid}>
                        {enrollments
                            .filter(e => new Date(e.start_time) > new Date())
                            .slice(0, 4)
                            .map((exam) => (
                                <div key={`${exam.exam_id}-${exam.student_id}`} className={styles.infoCard}>
                                    <h3 className={styles.infoCardTitle}>{exam.title}</h3>
                                    <p className={styles.infoCardDesc}>{exam.course_name}</p>
                                    <div className={styles.infoCardMeta}>
                                        <span>
                                            <FontAwesomeIcon icon={faCalendarAlt} />{' '}
                                            {new Date(exam.start_time).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <span className={`${styles.badge} ${exam.duration_minutes <= 30 ? styles.badgeGreen : styles.badgeAmber}`}>
                                            {exam.duration_minutes} min
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Recent Results</h2>
                    <Link to="/dashboard/student?tab=results" className={styles.sectionLink}>
                        View All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                {attempts.length === 0 ? (
                    <div className={styles.emptyState}>No exam attempts yet. Take your first exam!</div>
                ) : (
                    <div className={styles.cardGrid}>
                        {attempts.slice(0, 4).map((attempt) => (
                            <div key={attempt.attempt_id} className={styles.infoCard}>
                                <h3 className={styles.infoCardTitle}>{attempt.title}</h3>
                                <p className={styles.infoCardDesc}>
                                    Scored {attempt.score ?? 'N/A'} out of {attempt.total_marks} points.
                                </p>
                                <div className={styles.infoCardMeta}>
                                    <span className={`${styles.badge} ${(attempt.score || 0) >= (attempt.passing_marks || 0) ? styles.badgeGreen : styles.badgeAmber}`}>
                                        {(attempt.score || 0) >= (attempt.passing_marks || 0) ? 'Passed' : 'Failed'}
                                    </span>
                                    <span>{attempt.score ?? '—'}/{attempt.total_marks}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;