import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faShieldHalved, faBolt, faClock, faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Dashboard.module.css';

function GuestDashboard() {
    return (
        <div className={styles.dashboard}>
            <div className={styles.guestHero}>
                <div className={styles.guestHeroIcon}>
                    <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <h1 className={styles.guestHeroTitle}>Welcome to Exam Hub</h1>
                <p className={styles.guestHeroDesc}>
                    The smart online examination platform built for modern educational institutions. 
                    Create, manage, and evaluate assessments with ease and precision.
                </p>
                <div className={styles.guestActions}>
                    <Link to="/auth?mode=register" className={styles.btnPrimary}>
                        Get Started Free
                    </Link>
                    <Link to="/auth?mode=login" className={styles.btnOutline}>
                        Sign In
                    </Link>
                </div>
            </div>

            <div className={styles.guestFeatures}>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faShieldHalved} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>Secure Exams</h3>
                    <p className={styles.guestFeatureDesc}>End-to-end encrypted assessments with advanced anti-cheat protection.</p>
                </div>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faBolt} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>Instant Results</h3>
                    <p className={styles.guestFeatureDesc}>Auto-graded exams with detailed analytics available immediately.</p>
                </div>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faClock} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>Timed Exams</h3>
                    <p className={styles.guestFeatureDesc}>Schedule exams with precise start and end times for complete control.</p>
                </div>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>Role-Based Access</h3>
                    <p className={styles.guestFeatureDesc}>Separate dashboards for students, instructors, and administrators.</p>
                </div>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faChartLine} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>Analytics</h3>
                    <p className={styles.guestFeatureDesc}>Track performance with detailed statistics and progress reports.</p>
                </div>
                <div className={styles.guestFeatureCard}>
                    <div className={styles.guestFeatureIcon}>
                        <FontAwesomeIcon icon={faGraduationCap} />
                    </div>
                    <h3 className={styles.guestFeatureTitle}>MCQ & Essays</h3>
                    <p className={styles.guestFeatureDesc}>Support for multiple choice and short answer question types.</p>
                </div>
            </div>
        </div>
    );
}

export default GuestDashboard;