import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBookOpen, faFileAlt, faShieldHalved, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Dashboard.module.css';

function AdminDashboard() {
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

    const firstName = user?.first_name || 'Admin';

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
                        <span className={styles.statValue}>1,248</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                        <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>24</span>
                        <span className={styles.statLabel}>Courses</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
                        <FontAwesomeIcon icon={faFileAlt} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>56</span>
                        <span className={styles.statLabel}>Exams</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <div className={styles.statContent}>
                        <span className={styles.statValue}>3</span>
                        <span className={styles.statLabel}>Admins</span>
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
                            <span className={`${styles.badge} ${styles.badgeBlue}`}>1,248 users</span>
                        </div>
                    </Link>
                    <Link to="/courses" className={styles.infoCard} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.infoCardTitle}>Course Management</h3>
                        <p className={styles.infoCardDesc}>Create and manage course catalog.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeGreen}`}>24 courses</span>
                        </div>
                    </Link>
                    <Link to="/categories" className={styles.infoCard} style={{ textDecoration: 'none' }}>
                        <h3 className={styles.infoCardTitle}>Categories</h3>
                        <p className={styles.infoCardDesc}>Organize exams with categories and tags.</p>
                        <div className={styles.infoCardMeta}>
                            <span className={`${styles.badge} ${styles.badgeAmber}`}>8 categories</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;