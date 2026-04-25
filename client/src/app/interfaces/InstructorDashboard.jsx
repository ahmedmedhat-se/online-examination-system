import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faUsers, faClipboardCheck, faClock, faArrowRight, faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Dashboard.module.css';

function InstructorDashboard() {
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

    const firstName = user?.first_name || 'Instructor';

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcome}>
                <h1 className={styles.greeting}>Welcome back, Dr. {firstName}!</h1>
                <p className={styles.subtitle}>Manage your exams and monitor student progress.</p>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>12</span>
                        <span className={styles.statLabel}>Active Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>156</span>
                        <span className={styles.statLabel}>Students</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faClipboardCheck} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>89</span>
                        <span className={styles.statLabel}>Submissions</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>34</span>
                        <span className={styles.statLabel}>Pending Review</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Your Exams</h2>
                    <Link to="/exams/manage" className={styles.sectionLink}>
                        Manage All <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                </div>
                <div className={styles.cardGrid}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>CS101 Midterm</h3>
                        <p className={styles.infoCardDesc}>Introduction to Programming — 42 students enrolled.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeBlue}`}>Published</span>
                            <span>90 min</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>IS201 Database Design</h3>
                        <p className={styles.infoCardDesc}>ERD, normalization, SQL — 38 students enrolled.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeBlue}`}>Published</span>
                            <span>120 min</span>
                        </div>
                    </div>
                    <div className={styles.infoCard}>
                        <h3 className={styles.infoCardTitle}>CS101 Final</h3>
                        <p className={styles.infoCardDesc}>Comprehensive Python programming exam.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeAmber}`}>Draft</span>
                            <span>180 min</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructorDashboard;