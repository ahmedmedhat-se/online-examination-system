import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faShieldHalved, faBolt, faClock, faUsers, faChartLine, faCalendarAlt, faSpinner, faBookOpen, faArrowRight, faBullseye, faCheckCircle, faChevronLeft, faChevronRight, faStar, faBell } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../config/axios.js';
import styles from '../styles/Dashboard.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function GuestDashboard() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [dismissedNotifications, setDismissedNotifications] = useState([]);
    const abortRef = useRef(null);

    useEffect(() => {
        abortRef.current = new AbortController();
        setLoading(true);
        apiClient.get('/api/exams', { signal: abortRef.current.signal })
            .then(res => {
                if (res.data.success) setExams(res.data.data.exams || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, []);

    const publishedExams = exams.filter(e => e.is_published);
    const now = new Date();

    const examDates = useMemo(() => {
        const map = {};
        publishedExams.forEach(exam => {
            const dateKey = new Date(exam.start_time).toDateString();
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(exam);
        });
        return map;
    }, [publishedExams]);

    const upcomingExams = publishedExams
        .filter(e => new Date(e.start_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const notificationExams = upcomingExams.filter(e => !dismissedNotifications.includes(e.exam_id));

    useEffect(() => {
        if (notificationExams.length > 0) {
            setShowNotification(true);
        }
    }, [notificationExams.length]);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const today = new Date().toDateString();

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
        setSelectedDate(null);
    };

    const getCalendarDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(d);
        }
        return days;
    };

    const getDateKey = (day) => {
        return new Date(currentYear, currentMonth, day).toDateString();
    };

    const getDayExams = (day) => {
        const key = getDateKey(day);
        return examDates[key] || [];
    };

    const todayExams = publishedExams.filter(e => {
        const start = new Date(e.start_time).toDateString();
        const end = new Date(e.end_time).toDateString();
        return start === today || end === today || (new Date(e.start_time) <= new Date() && new Date(e.end_time) >= new Date());
    });

    return (
        <div className={styles.dashboard}>
            {showNotification && notificationExams.length > 0 && (
                <div className={styles.notificationBar}>
                    <div className={styles.notificationContent}>
                        <FontAwesomeIcon icon={faBell} className={styles.notificationBell} />
                        <div className={styles.notificationText}>
                            <strong>{notificationExams.length} upcoming exam{notificationExams.length > 1 ? 's' : ''}</strong>
                            <span>{notificationExams[0].title} — {formatDate(notificationExams[0].start_time)} at {formatTime(notificationExams[0].start_time)}</span>
                        </div>
                        <div className={styles.notificationActions}>
                            <Link to="/auth?mode=login" className={styles.notificationEnroll}>Enroll Now</Link>
                            <button className={styles.notificationDismiss} onClick={() => setShowNotification(false)}>Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            <section className={styles.guestHero}>
                <div className={styles.heroBadge}>
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.heroBadgeIcon} />
                    <span>{publishedExams.length} published exams available</span>
                </div>
                <div className={styles.guestHeroIcon}>
                    <FontAwesomeIcon icon={faGraduationCap} />
                </div>
                <h1 className={styles.guestHeroTitle}>
                    Welcome to <span className={styles.heroHighlight}>Exam Hub</span>
                </h1>
                <p className={styles.guestHeroDesc}>
                    The smart online examination platform built for modern educational institutions.
                    Browse upcoming exams and start your assessment journey.
                </p>
                <div className={styles.guestActions}>
                    <Link to="/auth?mode=register" className={styles.btnPrimary}>
                        Get Started Free
                        <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                    <Link to="/auth?mode=login" className={styles.btnOutline}>
                        Sign In
                    </Link>
                </div>
            </section>

            <section className={styles.calendarSection}>
                <div className={styles.calendarGrid}>
                    <div className={styles.calendarMain}>
                        <div className={styles.calendarHeader}>
                            <button onClick={prevMonth} className={styles.calendarNav}><FontAwesomeIcon icon={faChevronLeft} /></button>
                            <h2 className={styles.calendarTitle}>{MONTHS[currentMonth]} {currentYear}</h2>
                            <button onClick={nextMonth} className={styles.calendarNav}><FontAwesomeIcon icon={faChevronRight} /></button>
                        </div>
                        <div className={styles.calendarWeekdays}>
                            {DAYS.map(day => <div key={day} className={styles.weekday}>{day}</div>)}
                        </div>
                        <div className={styles.calendarDays}>
                            {getCalendarDays().map((day, idx) => {
                                if (!day) return <div key={`empty-${idx}`} className={styles.calendarDay}></div>;
                                const dayExams = getDayExams(day);
                                const dateKey = getDateKey(day);
                                const isToday = dateKey === today;
                                const isSelected = selectedDate === dateKey;
                                const hasExam = dayExams.length > 0;
                                const hasUpcoming = dayExams.some(e => new Date(e.start_time) > now);
                                const hasLive = dayExams.some(e => new Date(e.start_time) <= now && new Date(e.end_time) >= now);
                                const hasPast = dayExams.length > 0 && !hasUpcoming && !hasLive;

                                return (
                                    <div
                                        key={day}
                                        className={`${styles.calendarDay} ${isToday ? styles.calendarToday : ''} ${isSelected ? styles.calendarSelected : ''} ${hasExam ? styles.calendarHasExam : ''}`}
                                        onClick={() => hasExam && setSelectedDate(isSelected ? null : dateKey)}
                                    >
                                        <span className={styles.dayNumber}>{day}</span>
                                        {hasExam && (
                                            <div className={styles.dayDots}>
                                                {hasLive && <span className={`${styles.dayDot} ${styles.dotLive}`}></span>}
                                                {hasUpcoming && <span className={`${styles.dayDot} ${styles.dotUpcoming}`}></span>}
                                                {hasPast && <span className={`${styles.dayDot} ${styles.dotPast}`}></span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.calendarLegend}>
                            <span><span className={`${styles.dayDot} ${styles.dotLive}`}></span> Live Now</span>
                            <span><span className={`${styles.dayDot} ${styles.dotUpcoming}`}></span> Upcoming</span>
                            <span><span className={`${styles.dayDot} ${styles.dotPast}`}></span> Completed</span>
                        </div>
                    </div>

                    <div className={styles.calendarSidebar}>
                        <h3 className={styles.sidebarTitle}>
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            {selectedDate
                                ? `Exams on ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                                : 'Today\'s Exams'}
                        </h3>
                        {loading ? (
                            <div className={styles.sidebarLoading}>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className={styles.sidebarExams}>
                                {(selectedDate
                                    ? (examDates[selectedDate] || [])
                                    : todayExams
                                ).map(exam => {
                                    const isLive = new Date(exam.start_time) <= now && new Date(exam.end_time) >= now;
                                    const isUpcoming = new Date(exam.start_time) > now;
                                    return (
                                        <div key={exam.exam_id} className={styles.sidebarExamCard}>
                                            <div className={styles.sidebarExamStatus}>
                                                <span className={`${styles.statusDot} ${isLive ? styles.dotLive : isUpcoming ? styles.dotUpcoming : styles.dotPast}`}></span>
                                                <span className={styles.statusLabel}>{isLive ? 'Live' : isUpcoming ? 'Upcoming' : 'Completed'}</span>
                                            </div>
                                            <h4>{exam.title}</h4>
                                            <p><FontAwesomeIcon icon={faBookOpen} /> {exam.course_name || exam.course_code}</p>
                                            <div className={styles.sidebarExamMeta}>
                                                <span><FontAwesomeIcon icon={faClock} /> {formatTime(exam.start_time)} - {formatTime(exam.end_time)}</span>
                                                <span><FontAwesomeIcon icon={faBullseye} /> {exam.total_marks} pts</span>
                                                <span><FontAwesomeIcon icon={faCheckCircle} /> Pass: {exam.passing_marks}</span>
                                            </div>
                                            {isLive && (
                                                <div className={styles.sidebarLiveBadge}>
                                                    <span className={styles.livePulse}></span> In Progress
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {(selectedDate ? (examDates[selectedDate] || []).length === 0 : todayExams.length === 0) && (
                                    <p className={styles.noData}>No exams {selectedDate ? 'on this date' : 'today'}.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.guestFeatures}>
                <div className={styles.sectionLabel}>Why Choose Exam Hub</div>
                <h2 className={styles.sectionHeading}>Everything you need for seamless assessments</h2>
                <div className={styles.featuresGrid}>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faShieldHalved} /></div>
                        <h3 className={styles.guestFeatureTitle}>Secure Exams</h3>
                        <p className={styles.guestFeatureDesc}>End-to-end encrypted assessments with advanced anti-cheat protection and browser lockdown.</p>
                    </div>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faBolt} /></div>
                        <h3 className={styles.guestFeatureTitle}>Instant Results</h3>
                        <p className={styles.guestFeatureDesc}>Auto-graded exams with detailed analytics available immediately upon submission.</p>
                    </div>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faClock} /></div>
                        <h3 className={styles.guestFeatureTitle}>Timed Exams</h3>
                        <p className={styles.guestFeatureDesc}>Schedule exams with precise start and end times for complete control over assessments.</p>
                    </div>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faUsers} /></div>
                        <h3 className={styles.guestFeatureTitle}>Role-Based Access</h3>
                        <p className={styles.guestFeatureDesc}>Separate dashboards for students, instructors, and administrators with custom permissions.</p>
                    </div>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faChartLine} /></div>
                        <h3 className={styles.guestFeatureTitle}>Advanced Analytics</h3>
                        <p className={styles.guestFeatureDesc}>Track performance with detailed statistics, progress reports, and score distributions.</p>
                    </div>
                    <div className={styles.guestFeatureCard}>
                        <div className={styles.guestFeatureIcon}><FontAwesomeIcon icon={faStar} /></div>
                        <h3 className={styles.guestFeatureTitle}>Smart Scheduling</h3>
                        <p className={styles.guestFeatureDesc}>Never miss an exam with calendar view, notifications, and date-based reminders.</p>
                    </div>
                </div>
            </section>

            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>Ready to take your exams?</h2>
                <p className={styles.ctaDesc}>Sign in to enroll in exams, track your progress, and get instant results.</p>
                <Link to="/auth?mode=register" className={styles.btnPrimary}>
                    Get Started Today
                    <FontAwesomeIcon icon={faArrowRight} />
                </Link>
            </section>
        </div>
    );
}

export default GuestDashboard;