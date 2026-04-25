import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faClock, faCheckCircle, faChartLine, faArrowRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Dashboard.module.css';

function StudentDashboard() {
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
    }, []);

    const firstName = user?.first_name || 'Student';

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Welcome back, {firstName}!</h1>
                <p className={styles.subtitle}>Here&apos;s your exam overview for today.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>4</span>
                        <span className={styles.statLabel}>Enrolled Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>2</span>
                        <span className={styles.statLabel}>Upcoming</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>85%</span>
                        <span className={styles.statLabel}>Avg Score</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>3</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Upcoming Exams</h2>
                    <Link to="/exams" className={styles.sectionLink}>
                        View All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                <div className={styles.cardGrid}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>CS101 Midterm</h3>
                        <p className={styles.infoCardDesc}>Covers variables, loops, and functions in Python.</p>
                        <div className={styles.infoCardMeta}>
                            <span><FontAwesomeIcon icon={faCalendarAlt} /> Apr 25, 2026</span>
                            <span className={`${styles.badge} ${styles.badgeAmber}`}>90 min</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>IS201 SQL Quiz</h3>
                        <p className={styles.infoCardDesc}>Basic SQL SELECT statements and queries.</p>
                        <div className={styles.infoCardMeta}>
                            <span><FontAwesomeIcon icon={faCalendarAlt} /> Apr 22, 2026</span>
                            <span className={`${styles.badge} ${styles.badgeGreen}`}>30 min</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Recent Results</h2>
                    <Link to="/results" className={styles.sectionLink}>
                        View All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                <div className={styles.cardGrid}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>CS101 Midterm</h3>
                        <p className={styles.infoCardDesc}>Scored 85 out of 100 points.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeGreen}`}>Passed</span>
                            <span>85/100</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>IS201 SQL Quiz</h3>
                        <p className={styles.infoCardDesc}>Scored 45 out of 50 points.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeGreen}`}>Passed</span>
                            <span>45/50</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;