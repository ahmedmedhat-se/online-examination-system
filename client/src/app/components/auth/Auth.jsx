import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faUser, faSpinner, faCircleCheck, faShieldHalved, faBolt, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import apiClient from '../../../config/axios.js';
import styles from '../../styles/Auth.module.css';
import logoImage from '../../../assets/sutech-logo.png';

const INITIAL_FORM = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
};

const ENCRYPTION_KEY = 'exam-hub-auth-salt';

function Auth() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const modeFromUrl = searchParams.get('mode');
    const [isRegister, setIsRegister] = useState(modeFromUrl === 'register');
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptCount, setAttemptCount] = useState(0);
    const formRef = useRef(null);
    const abortControllerRef = useRef(null);
    const sessionTokenRef = useRef(null);

    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        sessionTokenRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}-${crypto.randomUUID()}`;

        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        if (storedUser && accessToken) {
            try {
                const parsed = JSON.parse(storedUser);
                navigate(`/dashboard/${parsed.role}`, { replace: true });
            } catch {
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/', { replace: true });
            }
        }
    }, [navigate]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            clearFormData();
        };
    }, []);

    useEffect(() => {
        if (modeFromUrl === 'register') {
            setIsRegister(true);
        } else if (modeFromUrl === 'login') {
            setIsRegister(false);
        }
        setForm({ ...INITIAL_FORM });
        setErrors({});
        setTouched({});
        setServerError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, [modeFromUrl]);

    const clearFormData = useCallback(() => {
        setForm({ ...INITIAL_FORM });
        setErrors({});
        setTouched({});
        setServerError('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsSubmitting(false);
        setLoading(false);
    }, []);

    const sanitizeInput = useCallback((value) => {
        if (typeof value !== 'string') return '';
        return value
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .trim();
    }, []);

    const validateField = useCallback((name, value, formData) => {
        switch (name) {
            case 'first_name':
                if (isRegister && !value.trim()) return 'First name is required';
                if (value.length > 50) return 'Max 50 characters';
                if (value.length < 2 && isRegister) return 'Min 2 characters';
                if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'Only letters allowed';
                return '';
            case 'last_name':
                if (isRegister && !value.trim()) return 'Last name is required';
                if (value.length > 50) return 'Max 50 characters';
                if (value.length < 2 && isRegister) return 'Min 2 characters';
                if (!/^[a-zA-Z\s\-']+$/.test(value.trim())) return 'Only letters allowed';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (value.length > 100) return 'Email is too long';
                if (value.length < 5) return 'Email is too short';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Invalid email format';
                if (/[<>]/.test(value)) return 'Invalid characters in email';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (isRegister) {
                    if (value.length < 8) return 'At least 8 characters';
                    if (value.length > 128) return 'Password is too long';
                    if (value.includes(' ')) return 'No spaces allowed';
                    if (!/(?=.*[a-z])/.test(value)) return 'Include at least one lowercase letter';
                    if (!/(?=.*[A-Z])/.test(value)) return 'Include at least one uppercase letter';
                    if (!/(?=.*\d)/.test(value)) return 'Include at least one number';
                    if (!/(?=.*[@$!%*?&#])/.test(value)) return 'Include at least one special character';
                    const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein1', 'welcome1'];
                    if (commonPasswords.includes(value.toLowerCase())) return 'Password is too common';
                }
                return '';
            case 'confirm_password':
                if (isRegister && !value) return 'Please confirm password';
                if (isRegister && value !== formData.password) return 'Passwords do not match';
                return '';
            default:
                return '';
        }
    }, [isRegister]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const sanitized = name === 'email' ? value.trim().toLowerCase() : sanitizeInput(value);

        setForm(prev => {
            const updated = { ...prev, [name]: sanitized };
            if (touched[name]) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    [name]: validateField(name, sanitized, updated),
                }));
            }
            if (name === 'password' && touched.confirm_password && isRegister) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    confirm_password: updated.confirm_password !== sanitized ? 'Passwords do not match' : '',
                }));
            }
            return updated;
        });
        setServerError('');
    }, [touched, validateField, isRegister, sanitizeInput]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        setErrors(prev => ({
            ...prev,
            [name]: validateField(name, value, form),
        }));
    }, [form, validateField]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        if (attemptCount >= 5) {
            setServerError('Too many attempts. Please refresh the page and try again.');
            return;
        }

        setServerError('');

        const fieldsToValidate = isRegister
            ? ['first_name', 'last_name', 'email', 'password', 'confirm_password']
            : ['email', 'password'];

        const newErrors = {};
        const newTouched = {};
        fieldsToValidate.forEach(field => {
            newTouched[field] = true;
            newErrors[field] = validateField(field, form[field], form);
        });

        setTouched(newTouched);
        setErrors(newErrors);

        if (Object.values(newErrors).some(Boolean)) return;

        setIsSubmitting(true);
        setLoading(true);
        setAttemptCount(prev => prev + 1);

        abortControllerRef.current = new AbortController();

        const payload = isRegister
            ? {
                email: form.email,
                password: form.password,
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                role: 'student',
            }
            : {
                email: form.email,
                password: form.password,
            };

        try {
            const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';

            const response = await apiClient.post(endpoint, payload, {
                signal: abortControllerRef.current?.signal,
                headers: {
                    'X-Session-Token': sessionTokenRef.current,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.data.success) {
                const data = response.data.data || response.data;
                const user = data.user;
                const tokens = data.tokens || response.data.tokens;

                if (user) {
                    const cleanUser = {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        role: user.role,
                        is_active: user.is_active,
                        last_login: user.last_login,
                        created_at: user.created_at,
                    };
                    localStorage.setItem('user', JSON.stringify(cleanUser));
                }

                if (tokens) {
                    localStorage.setItem('accessToken', tokens.access_token);
                    localStorage.setItem('refreshToken', tokens.refresh_token);
                }

                clearFormData();
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('auth-change'));

                const role = user?.role || 'student';
                navigate(`/dashboard/${role}`, { replace: true });
            } else {
                setServerError(response.data.message || 'Authentication failed.');
            }
        } catch (error) {
            if (axios.isCancel(error)) return;

            if (error.response) {
                const { status, data } = error.response;
                switch (status) {
                    case 401:
                        setServerError('Invalid email or password.');
                        break;
                    case 403:
                        setServerError('Account is deactivated. Contact support.');
                        break;
                    case 409:
                        setServerError('An account with this email already exists.');
                        break;
                    case 429:
                        setServerError('Too many requests. Please wait and try again.');
                        break;
                    default:
                        setServerError(data?.message || 'Something went wrong. Please try again.');
                }

                if (status === 429) {
                    const retryAfter = error.response.headers['retry-after'];
                    if (retryAfter) {
                        setServerError(`Too many attempts. Try again in ${retryAfter} seconds.`);
                    }
                }
            } else if (error.request) {
                setServerError('Unable to connect to the server. Check your internet connection.');
            } else {
                setServerError('An unexpected error occurred.');
            }

            setForm(prev => ({
                ...prev,
                password: '',
                confirm_password: '',
            }));
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    }, [form, isRegister, navigate, validateField, isSubmitting, attemptCount, clearFormData]);

    const toggleMode = useCallback(() => {
        setIsRegister(prev => !prev);
        clearFormData();
        setAttemptCount(0);
    }, [clearFormData]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    }, []);

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                <div className={styles.brandPanel}>
                    <img src={logoImage} alt="Exam Hub" className={styles.brandLogo} loading="lazy" />
                    <h1 className={styles.brandTitle}>Exam Hub</h1>
                    <p className={styles.brandSubtitle}>
                        The smart online examination platform for modern educational institutions.
                    </p>
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <FontAwesomeIcon icon={faCircleCheck} className={styles.featureIcon} />
                            Secure assessments
                        </div>
                        <div className={styles.featureItem}>
                            <FontAwesomeIcon icon={faShieldHalved} className={styles.featureIcon} />
                            256-bit encryption
                        </div>
                        <div className={styles.featureItem}>
                            <FontAwesomeIcon icon={faBolt} className={styles.featureIcon} />
                            Instant results
                        </div>
                    </div>
                </div>

                <div className={styles.formPanel}>
                    <div className={styles.formHeader}>
                        <h2 className={styles.formTitle}>
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className={styles.formSubtitle}>
                            {isRegister ? (
                                <>Already have an account? <Link to="/auth?mode=login" onClick={(e) => { e.preventDefault(); toggleMode(); }}>Sign in</Link></>
                            ) : (
                                <>Don&apos;t have an account? <Link to="/auth?mode=register" onClick={(e) => { e.preventDefault(); toggleMode(); }}>Create one</Link></>
                            )}
                        </p>
                    </div>

                    {serverError && (
                        <div className={styles.serverError} role="alert">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <span>{serverError}</span>
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} noValidate autoComplete="off">
                        <input type="text" name="username" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
                        <input type="password" name="fake_password" autoComplete="off" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

                        {isRegister && (
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="first_name">
                                        First Name <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            type="text"
                                            placeholder="John"
                                            className={`${styles.input} ${touched.first_name && errors.first_name ? styles.inputError : ''}`}
                                            value={form.first_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autoComplete="off"
                                            maxLength={50}
                                            disabled={loading}
                                            spellCheck={false}
                                        />
                                    </div>
                                    {touched.first_name && errors.first_name && (
                                        <span className={styles.errorText} role="alert">{errors.first_name}</span>
                                    )}
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label} htmlFor="last_name">
                                        Last Name <span className={styles.required}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            type="text"
                                            placeholder="Doe"
                                            className={`${styles.input} ${touched.last_name && errors.last_name ? styles.inputError : ''}`}
                                            value={form.last_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            autoComplete="off"
                                            maxLength={50}
                                            disabled={loading}
                                            spellCheck={false}
                                        />
                                    </div>
                                    {touched.last_name && errors.last_name && (
                                        <span className={styles.errorText} role="alert">{errors.last_name}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="email">
                                Email Address <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`${styles.input} ${touched.email && errors.email ? styles.inputError : ''}`}
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="off"
                                    maxLength={100}
                                    disabled={loading}
                                    spellCheck={false}
                                />
                            </div>
                            {touched.email && errors.email && (
                                <span className={styles.errorText} role="alert">{errors.email}</span>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label} htmlFor="password">
                                Password <span className={styles.required}>*</span>
                            </label>
                            <div className={styles.inputWrapper}>
                                <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={isRegister ? 'Min 8 chars, mix of letters, numbers & symbols' : 'Enter your password'}
                                    className={`${styles.input} ${touched.password && errors.password ? styles.inputError : ''}`}
                                    value={form.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="off"
                                    maxLength={128}
                                    disabled={loading}
                                    spellCheck={false}
                                />
                                <button
                                    type="button"
                                    className={styles.passwordToggle}
                                    onClick={() => setShowPassword(prev => !prev)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <span className={styles.errorText} role="alert">{errors.password}</span>
                            )}
                        </div>

                        {isRegister && (
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="confirm_password">
                                    Confirm Password <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.inputWrapper}>
                                    <FontAwesomeIcon icon={faLock} className={styles.inputIcon} />
                                    <input
                                        id="confirm_password"
                                        name="confirm_password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Re-enter your password"
                                        className={`${styles.input} ${touched.confirm_password && errors.confirm_password ? styles.inputError : ''}`}
                                        value={form.confirm_password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        autoComplete="off"
                                        maxLength={128}
                                        disabled={loading}
                                        spellCheck={false}
                                    />
                                    <button
                                        type="button"
                                        className={styles.passwordToggle}
                                        onClick={() => setShowConfirmPassword(prev => !prev)}
                                        tabIndex={-1}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                    </button>
                                </div>
                                {touched.confirm_password && errors.confirm_password && (
                                    <span className={styles.errorText} role="alert">{errors.confirm_password}</span>
                                )}
                            </div>
                        )}

                        <button type="submit" className={styles.submitBtn} disabled={loading || attemptCount >= 5}>
                            {loading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className={styles.spinner} />
                                    {isRegister ? 'Creating account...' : 'Signing in...'}
                                </>
                            ) : attemptCount >= 5 ? (
                                'Too Many Attempts'
                            ) : (
                                isRegister ? 'Create Account' : 'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Auth;