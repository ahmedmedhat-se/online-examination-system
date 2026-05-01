import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faToggleOn, faToggleOff, faEye } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

function ExamManagement() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const fetchExams = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get('/api/exams', { signal: abortRef.current.signal });
            if (res.data.success) setExams(res.data.data.exams);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load exams.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExams();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchExams]);

    const togglePublish = async (examId, currentStatus) => {
        try {
            await apiClient.put(`/api/exams/${examId}`, { is_published: !currentStatus });
            setExams(prev => prev.map(e => e.exam_id === examId ? { ...e, is_published: !currentStatus } : e));
        } catch {
            setError('Action failed.');
        }
    };

    const deleteExam = async (examId) => {
        if (!window.confirm('Delete this exam?')) return;
        try {
            await apiClient.delete(`/api/exams/${examId}`);
            setExams(prev => prev.filter(e => e.exam_id !== examId));
        } catch {
            setError('Delete failed.');
        }
    };

    if (loading) {
        return <div className={adminStyles.centerState}><FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} /><span>Loading exams...</span></div>;
    }

    return (
        <div className={adminStyles.tableContainer}>
            {error && <div className={adminStyles.toast}>{error}</div>}
            <div className={adminStyles.tableHeader}><h2>All Exams ({exams.length})</h2></div>
            <div className={adminStyles.tableWrap}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Course</th>
                            <th>Duration</th>
                            <th>Marks</th>
                            <th>Published</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exams.map(e => (
                            <tr key={e.exam_id}>
                                <td>{e.title}</td>
                                <td>{e.course_name || '—'}</td>
                                <td>{e.duration_minutes} min</td>
                                <td>{e.total_marks}</td>
                                <td>
                                    <span className={e.is_published ? adminStyles.statusActive : adminStyles.statusInactive}>
                                        {e.is_published ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <div className={adminStyles.actions}>
                                        <button className={adminStyles.actionBtn} onClick={() => togglePublish(e.exam_id, e.is_published)} title="Toggle Publish">
                                            <FontAwesomeIcon icon={e.is_published ? faToggleOn : faToggleOff} />
                                        </button>
                                        <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteExam(e.exam_id)} title="Delete">
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {exams.length === 0 && <tr><td colSpan={6} className={adminStyles.emptyRow}>No exams found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ExamManagement;