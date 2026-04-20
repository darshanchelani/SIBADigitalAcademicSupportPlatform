import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';

function QuizManagement() {
  const confirm = useConfirm();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showResults, setShowResults] = useState(null);
  const [results, setResults] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    password: '',
    duration: 15,
    expiresAt: '',
    questions: [{ question: '', options: ['', ''], correctAnswer: 0 }],
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', ''], correctAnswer: 0 }],
    }));
  };

  const handleRemoveQuestion = (index) => {
    if (form.questions.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[qIndex] = { ...questions[qIndex], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const handleAddOption = (qIndex) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[qIndex] = {
        ...questions[qIndex],
        options: [...questions[qIndex].options, ''],
      };
      return { ...prev, questions };
    });
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    if (form.questions[qIndex].options.length <= 2) return;
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = questions[qIndex].options.filter((_, i) => i !== oIndex);
      const correctAnswer =
        questions[qIndex].correctAnswer >= options.length ? 0 : questions[qIndex].correctAnswer;
      questions[qIndex] = { ...questions[qIndex], options, correctAnswer };
      return { ...prev, questions };
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    // Validate
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.password || form.password.length < 4)
      return toast.error('Password must be at least 4 characters');
    if (!form.expiresAt) return toast.error('Expiry date is required');

    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!q.question.trim()) return toast.error(`Question ${i + 1} text is empty`);
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) return toast.error(`Question ${i + 1}, option ${j + 1} is empty`);
      }
    }

    setCreating(true);
    try {
      await axios.post('/quizzes', form);
      toast.success('Quiz created successfully!');
      setShowCreate(false);
      setForm({
        title: '',
        description: '',
        password: '',
        duration: 15,
        expiresAt: '',
        questions: [{ question: '', options: ['', ''], correctAnswer: 0 }],
      });
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    const ok = await confirm({
      title: 'Delete this quiz?',
      message: 'The quiz and every student attempt on it will be removed. This cannot be undone.',
      confirmLabel: 'Delete quiz',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await axios.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const handleViewResults = async (quizId) => {
    try {
      const response = await axios.get(`/quizzes/${quizId}/results`);
      setResults(response.data);
      setShowResults(quizId);
    } catch (error) {
      toast.error('Failed to load results');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quiz Management</h1>
          <p className="text-surface-500 text-sm mt-1">{quizzes.length} quizzes created</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showCreate ? 'Cancel' : 'Create Quiz'}</span>
        </button>
      </div>

      {/* Create Quiz Form */}
      {showCreate && (
        <div className="card p-6 mb-8 animate-fade-in-up">
          <h2 className="section-title mb-4">New Quiz</h2>
          <form onSubmit={handleCreateQuiz} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-modern"
                  placeholder="Quiz title"
                  maxLength={200}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Password (share with students)
                </label>
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-modern"
                  placeholder="Quiz access password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Description (optional)
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input-modern resize-none"
                rows={2}
                placeholder="Brief description..."
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 1 })}
                  className="input-modern"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">
                  Expires At
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="input-modern"
                  required
                />
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-surface-800">Questions</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-secondary text-sm !py-2 !px-3"
                >
                  + Add Question
                </button>
              </div>

              <div className="space-y-5">
                {form.questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="bg-surface-50 rounded-xl p-5 border border-surface-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="badge-blue">Q{qIndex + 1}</span>
                      {form.questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-red-400 hover:text-red-600 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      className="input-modern mb-3"
                      placeholder="Enter question..."
                      required
                    />

                    <div className="space-y-2 mb-3">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === oIndex}
                            onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                            className="w-4 h-4 text-primary-600"
                            title="Mark as correct answer"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            className="input-modern flex-1 !py-2"
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOption(qIndex)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      + Add Option
                    </button>
                    <p className="text-xs text-surface-400 mt-1">
                      Select radio button to mark correct answer
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={creating} className="btn-primary w-full">
              {creating ? 'Creating...' : 'Create Quiz'}
            </button>
          </form>
        </div>
      )}

      {/* Results Modal */}
      {showResults && results && (
        <div className="card p-6 mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="section-title">{results.quiz.title} — Results</h2>
            <button
              onClick={() => {
                setShowResults(null);
                setResults(null);
              }}
              className="text-surface-400 hover:text-surface-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {results.attempts.length === 0 ? (
            <p className="text-surface-400 text-center py-6">No attempts yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200">
                    <th className="text-left py-3 px-2 text-surface-600 font-semibold">Rank</th>
                    <th className="text-left py-3 px-2 text-surface-600 font-semibold">Student</th>
                    <th className="text-left py-3 px-2 text-surface-600 font-semibold">Score</th>
                    <th className="text-left py-3 px-2 text-surface-600 font-semibold">
                      Percentage
                    </th>
                    <th className="text-left py-3 px-2 text-surface-600 font-semibold">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.attempts.map((a, i) => (
                    <tr key={a._id} className="border-b border-surface-100 hover:bg-surface-50">
                      <td className="py-3 px-2 font-semibold text-surface-700">#{i + 1}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-surface-800">{a.userId?.name}</p>
                        <p className="text-xs text-surface-400">{a.userId?.email}</p>
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        {a.score}/{results.quiz.totalQuestions}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`badge-${Math.round((a.score / results.quiz.totalQuestions) * 100) >= 50 ? 'green' : 'red'}`}
                        >
                          {Math.round((a.score / results.quiz.totalQuestions) * 100)}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-surface-500 text-xs">
                        {a.completedAt ? new Date(a.completedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quiz List */}
      {quizzes.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-surface-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-surface-600 mb-1 font-medium">No quizzes yet</p>
          <p className="text-surface-400 text-sm mb-6">Create your first quiz for students</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz, i) => (
            <div
              key={quiz._id}
              className="card p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-surface-900 mb-1">{quiz.title}</h3>
                  {quiz.description && (
                    <p className="text-surface-500 text-sm mb-2">{quiz.description}</p>
                  )}
                  {quiz.createdBy?.name && (
                    <p className="text-xs text-surface-500 mb-2">
                      Created by:{' '}
                      <span className="font-medium text-surface-700">{quiz.createdBy.name}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="badge-blue">{quiz.questions?.length || '?'} Questions</span>
                    <span className="badge-purple">{quiz.duration} min</span>
                    {new Date(quiz.expiresAt) > new Date() && quiz.isActive ? (
                      <span className="badge-green">Active</span>
                    ) : (
                      <span className="badge-red">Expired</span>
                    )}
                    <span className="text-surface-400 text-xs">
                      Expires: {new Date(quiz.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewResults(quiz._id)}
                    className="btn-secondary !py-2 !px-3 text-sm"
                  >
                    Results
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz._id)}
                    className="btn-danger !py-2 !px-3 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizManagement;
