import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faXTwitter, faInstagram, faYoutube, faGithub, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faChevronRight, faHeart } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Footer.module.css';
import logoImage from '../../assets/sutech-logo.png';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer} role="contentinfo">
            <div className={styles.footerGrid}>
                <div className={styles.footerBrand}>
                    <div className={styles.footerLogo}>
                        <img
                            src={logoImage}
                            alt="Exam Hub Logo"
                            className={styles.footerLogoImage}
                        />
                        <span className={styles.footerLogoText}>Exam Hub</span>
                    </div>
                    <p className={styles.footerDescription}>
                        A modern online examination platform empowering educators to create, manage, and evaluate assessments with ease and precision.
                    </p>
                    <div className={styles.footerSocials}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                            <FontAwesomeIcon icon={faFacebookF} />
                        </a>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X">
                            <FontAwesomeIcon icon={faXTwitter} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                            <FontAwesomeIcon icon={faInstagram} />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                            <FontAwesomeIcon icon={faYoutube} />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
                            <FontAwesomeIcon icon={faGithub} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                            <FontAwesomeIcon icon={faLinkedinIn} />
                        </a>
                        <a href="mailto:support@examhub.com" className={styles.socialLink} aria-label="Email">
                            <FontAwesomeIcon icon={faEnvelope} />
                        </a>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h4 className={styles.footerHeading}>Platform</h4>
                    <div className={styles.footerLinks}>
                        <Link to="/exams" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Browse Exams
                        </Link>
                        <Link to="/dashboard" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Dashboard
                        </Link>
                        <Link to="/results" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Results
                        </Link>
                        <Link to="/courses" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Courses
                        </Link>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h4 className={styles.footerHeading}>Support</h4>
                    <div className={styles.footerLinks}>
                        <Link to="/help" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Help Center
                        </Link>
                        <Link to="/faq" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            FAQs
                        </Link>
                        <Link to="/contact" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Contact Us
                        </Link>
                        <Link to="/documentation" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Documentation
                        </Link>
                    </div>
                </div>

                <div className={styles.footerSection}>
                    <h4 className={styles.footerHeading}>Legal</h4>
                    <div className={styles.footerLinks}>
                        <Link to="/privacy" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Terms of Service
                        </Link>
                        <Link to="/cookies" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Cookie Policy
                        </Link>
                        <Link to="/accessibility" className={styles.footerLink}>
                            <FontAwesomeIcon icon={faChevronRight} className={styles.footerLinkIcon} />
                            Accessibility
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <span>
                    &copy; {currentYear} <strong>Exam Hub</strong>. All rights reserved.
                </span>
                <div className={styles.footerBottomLinks}>
                    <Link to="/privacy" className={styles.footerBottomLink}>Privacy</Link>
                    <Link to="/terms" className={styles.footerBottomLink}>Terms</Link>
                    <Link to="/sitemap" className={styles.footerBottomLink}>Sitemap</Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;