import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faSpinner, faPlus, faEdit, faSave, faTimes, faSearch, faQuestionCircle, faListOl, faCheckCircle, faAlignLeft, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../../../config/axios.js';
import adminStyles from '../../styles/AdminDashboard.module.css';

const QUESTION_TYPES = ['MCQ', 'SHORT_ANSWER'];
const PAGE_SIZE = 10;

const INITIAL_FORM = { question_text: '', question_type: 'MCQ', options: ['', '', '', ''], correct_answer: '', marks: 1 };

function QuestionManagement({ examId, onClose }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...INITIAL_FORM });
    const [editForm, setEditForm] = useState({ ...INITIAL_FORM });
    const [submitting, setSubmitting] = useState(false);
    const abortRef = useRef(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        try {
            const res = await apiClient.get(`/api/v1/questions/exam/${examId}`, { signal: abortRef.current.signal });
            if (res.data.success) setQuestions(res.data.data.questions);
        } catch (err) {
            if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
            setError('Failed to load questions.');
        } finally {
            setLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchQuestions();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchQuestions]);

    const filteredQuestions = useMemo(() => {
        if (!search) return questions;
        const s = search.toLowerCase();
        return questions.filter(q => q.question_text.toLowerCase().includes(s) || q.correct_answer.toLowerCase().includes(s));
    }, [questions, search]);

    const paginatedQuestions = useMemo(() => filteredQuestions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filteredQuestions, page]);
    const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
    useEffect(() => { setPage(0); }, [search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.question_text.trim() || !form.correct_answer.trim()) return;
        setSubmitting(true);
        try {
            const payload = {
                exam_id: examId,
                question_text: form.question_text.trim().slice(0, 1000),
                question_type: form.question_type,
                options: form.question_type === 'MCQ' ? form.options.map(o => o.trim()).filter(o => o) : null,
                correct_answer: form.correct_answer.trim().slice(0, 500),
                marks: Math.max(1, Math.min(100, parseInt(form.marks) || 1)),
                question_order: questions.length + 1,
            };
            const res = await apiClient.post('/api/v1/questions', payload);
            if (res.data.success) {
                setQuestions(prev => [...prev, res.data.data.question]);
                setShowForm(false);
                setForm({ ...INITIAL_FORM });
            }
        } catch {
            setError('Failed to create question.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (q) => {
        setEditingId(q.question_id);
        setEditForm({
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options && q.options.length ? q.options : ['', '', '', ''],
            correct_answer: q.correct_answer,
            marks: q.marks,
        });
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = async (questionId) => {
        if (!editForm.question_text.trim() || !editForm.correct_answer.trim()) return;
        setSubmitting(true);
        try {
            const payload = {
                question_text: editForm.question_text.trim().slice(0, 1000),
                question_type: editForm.question_type,
                options: editForm.question_type === 'MCQ' ? editForm.options.map(o => o.trim()).filter(o => o) : null,
                correct_answer: editForm.correct_answer.trim().slice(0, 500),
                marks: Math.max(1, Math.min(100, parseInt(editForm.marks) || 1)),
                question_order: editForm.question_order,
            };
            await apiClient.put(`/api/v1/questions/${questionId}`, payload);
            setQuestions(prev => prev.map(q => q.question_id === questionId ? { ...q, ...payload, options: payload.options } : q));
            cancelEdit();
        } catch {
            setError('Update failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const deleteQuestion = async (questionId) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await apiClient.delete(`/api/v1/questions/${questionId}`);
            setQuestions(prev => prev.filter(q => q.question_id !== questionId));
        } catch {
            setError('Delete failed.');
        }
    };

    const updateOption = (index, value, isEdit) => {
        const setter = isEdit ? setEditForm : setForm;
        setter(prev => {
            const opts = [...prev.options];
            opts[index] = value;
            return { ...prev, options: opts };
        });
    };

    const marksSum = questions.reduce((sum, q) => sum + q.marks, 0);

    if (loading) {
        return <div className={adminStyles.centerState}><FontAwesomeIcon icon={faSpinner} spin className={adminStyles.loadingIcon} /><span>Loading questions...</span></div>;
    }

    return (
        <div className={adminStyles.tableContainer}>
            <div className={adminStyles.tableHeader}>
                <h2>Questions Management ({questions.length}) — Total: {marksSum} marks</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className={adminStyles.addBtn} onClick={() => { setShowForm(!showForm); cancelEdit(); }}>
                        <FontAwesomeIcon icon={faPlus} /> Add Question
                    </button>
                    {onClose && (
                        <button className={adminStyles.addBtn} onClick={onClose} style={{ background: '#64748b' }}>
                            Back to Exams
                        </button>
                    )}
                </div>
            </div>

            {error && <div className={adminStyles.toast}>{error}</div>}

            <div className={adminStyles.toolbar}>
                <div className={adminStyles.searchWrap}>
                    <FontAwesomeIcon icon={faSearch} className={adminStyles.searchIcon} />
                    <input type="text" placeholder="Search questions or answers..." value={search} onChange={e => setSearch(e.target.value.slice(0, 200))} className={adminStyles.searchInput} maxLength={200} />
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleAdd} className={adminStyles.formCard}>
                    <h3 className={adminStyles.formTitle}><FontAwesomeIcon icon={faQuestionCircle} /> New Question</h3>

                    <div className={adminStyles.formGroup}>
                        <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faLayerGroup} /> Question Type</label>
                        <select value={form.question_type} onChange={e => setForm(p => ({ ...p, question_type: e.target.value, options: ['', '', '', ''], correct_answer: '' }))} className={adminStyles.editSelect}>
                            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t === 'MCQ' ? 'Multiple Choice (MCQ)' : 'Short Answer'}</option>)}
                        </select>
                    </div>

                    <div className={adminStyles.formGroup}>
                        <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faAlignLeft} /> Question Text</label>
                        <textarea placeholder="Enter the question..." value={form.question_text} onChange={e => setForm(p => ({ ...p, question_text: e.target.value }))} className={adminStyles.editTextarea} rows={3} maxLength={1000} required />
                    </div>

                    {form.question_type === 'MCQ' && (
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}><FontAwesomeIcon icon={faListOl} /> Answer Options</label>
                            <div className={adminStyles.optionsGrid}>
                                {form.options.map((opt, i) => (
                                    <div key={i} className={adminStyles.optionRow}>
                                        <span className={adminStyles.optionLabel}>{String.fromCharCode(65 + i)}</span>
                                        <input
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            value={opt}
                                            onChange={e => updateOption(i, e.target.value, false)}
                                            className={adminStyles.editInput}
                                            maxLength={200}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={adminStyles.formRow}>
                        <div className={adminStyles.formGroup}>
                            <label className={adminStyles.formLabel}>
                                <FontAwesomeIcon icon={faCheckCircle} /> Correct Answer
                                {form.question_type === 'MCQ' && <span style={{ fontWeight: 400, textTransform: 'none', marginLeft: 4 }}>(e.g. A, B, C, D)</span>}
                            </label>
                            <input
                                placeholder={form.question_type === 'MCQ' ? 'A' : 'Enter the correct answer...'}
                                value={form.correct_answer}
                                onChange={e => setForm(p => ({ ...p, correct_answer: e.target.value }))}
                                className={adminStyles.editInput}
                                maxLength={500}
                                required
                            />
                        </div>
                        <div className={adminStyles.formGroup} style={{ maxWidth: '140px' }}>
                            <label className={adminStyles.formLabel}>Marks</label>
                            <input type="number" value={form.marks} onChange={e => setForm(p => ({ ...p, marks: parseInt(e.target.value) || 1 }))} className={adminStyles.editInput} min="1" max="100" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className={adminStyles.submitBtn} disabled={submitting}>
                            {submitting ? 'Adding...' : 'Add Question'}
                        </button>
                        <button type="button" className={adminStyles.addBtn} style={{ background: '#e2e8f0', color: '#475569' }} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className={adminStyles.tableWrap}>
                <table className={adminStyles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Question</th>
                            <th>Type</th>
                            <th>Answer</th>
                            <th>Marks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedQuestions.map((q) => (
                            <tr key={q.question_id}>
                                <td>{q.question_order}</td>
                                <td>
                                    {editingId === q.question_id ? (
                                        <textarea value={editForm.question_text} onChange={e => setEditForm(p => ({ ...p, question_text: e.target.value }))} className={adminStyles.editTextarea} rows={2} maxLength={1000} />
                                    ) : (
                                        <div style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>{q.question_text}</div>
                                            {q.question_type === 'MCQ' && q.options && (
                                                <div style={{ fontSize: 12, color: '#64748b' }}>
                                                    {q.options.map((o, i) => <span key={i} style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)}. {o}</span>)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {editingId === q.question_id ? (
                                        <select value={editForm.question_type} onChange={e => setEditForm(p => ({ ...p, question_type: e.target.value }))} className={adminStyles.editSelect}>
                                            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    ) : (
                                        <span className={`${adminStyles.badge} ${q.question_type === 'MCQ' ? adminStyles.roleInstructor : adminStyles.roleStudent}`}>{q.question_type}</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === q.question_id ? (
                                        <input value={editForm.correct_answer} onChange={e => setEditForm(p => ({ ...p, correct_answer: e.target.value }))} className={adminStyles.editInput} maxLength={500} />
                                    ) : (
                                        <span style={{ fontWeight: 600, color: '#16a34a' }}>{q.correct_answer}</span>
                                    )}
                                </td>
                                <td>
                                    {editingId === q.question_id ? (
                                        <input type="number" value={editForm.marks} onChange={e => setEditForm(p => ({ ...p, marks: parseInt(e.target.value) || 1 }))} className={adminStyles.editInput} style={{ width: '70px' }} min="1" max="100" />
                                    ) : (
                                        <span style={{ fontWeight: 700 }}>{q.marks}</span>
                                    )}
                                </td>
                                <td>
                                    <div className={adminStyles.actions}>
                                        {editingId === q.question_id ? (
                                            <>
                                                <button className={adminStyles.actionBtn} onClick={() => saveEdit(q.question_id)} disabled={submitting} title="Save">
                                                    <FontAwesomeIcon icon={faSave} />
                                                </button>
                                                <button className={adminStyles.actionBtn} onClick={cancelEdit} title="Cancel">
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className={adminStyles.actionBtn} onClick={() => startEdit(q)} title="Edit">
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                                <button className={`${adminStyles.actionBtn} ${adminStyles.actionDelete}`} onClick={() => deleteQuestion(q.question_id)} title="Delete">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedQuestions.length === 0 && (
                            <tr><td colSpan={6} className={adminStyles.emptyRow}>No questions yet. Add your first question.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className={adminStyles.pagination}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className={adminStyles.pageBtn}>Previous</button>
                    <span className={adminStyles.pageInfo}>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className={adminStyles.pageBtn}>Next</button>
                </div>
            )}
        </div>
    );
}

export default QuestionManagement;