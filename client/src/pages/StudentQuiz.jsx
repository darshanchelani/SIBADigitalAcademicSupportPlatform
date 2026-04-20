import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useConfirm } from '../components/ConfirmDialog';

function StudentQuiz() {
  const confirm = useConfirm();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(-1); // -1 = not started
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [screenBlurred, setScreenBlurred] = useState(false);
  const timerRef = useRef(null);
  const timerStartedRef = useRef(false);

  // Review state
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);

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

  const handleAutoSubmit = useCallback(async () => {
    if (!activeQuiz || submitting) return;
    setSubmitting(true);
    try {
      const response = await axios.post(`/quizzes/${activeQuiz.quizId}/submit`, { answers });
      setResult(response.data);
      timerStartedRef.current = false;
      setActiveQuiz(null);
      setScreenBlurred(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success(
        `Quiz submitted! Score: ${response.data.score}/${response.data.totalQuestions}`
      );
      fetchQuizzes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  }, [activeQuiz, answers, submitting]);

  // Timer effect
  useEffect(() => {
    if (!activeQuiz) {
      timerStartedRef.current = false;
      return;
    }
    const duration = activeQuiz.duration * 60;
    setTimeLeft(duration);
    timerStartedRef.current = true;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuiz]);

  // Auto-submit when time runs out (only if timer actually started)
  useEffect(() => {
    if (timeLeft === 0 && timerStartedRef.current && activeQuiz && !submitting && !result) {
      handleAutoSubmit();
    }
  }, [timeLeft, activeQuiz, submitting, result, handleAutoSubmit]);

  // === Anti-cheat: prevent copy, cut, context menu, print screen ===
  useEffect(() => {
    if (!activeQuiz) return;

    const preventCopy = (e) => {
      e.preventDefault();
      toast.error('Copying is not allowed during the quiz');
    };
    const preventContextMenu = (e) => {
      e.preventDefault();
    };
    const preventPrintScreen = (e) => {
      // PrintScreen key or common screenshot shortcuts
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) ||
        (e.metaKey &&
          e.shiftKey &&
          (e.key === 'S' || e.key === 's' || e.key === '3' || e.key === '4'))
      ) {
        e.preventDefault();
        setScreenBlurred(true);
        toast.error('Screenshots are not allowed!');
        setTimeout(() => setScreenBlurred(false), 2000);
      }
    };

    // Blur screen when tab loses focus (screenshot attempt or tab switch)
    const handleVisibilityChange = () => {
      if (document.hidden && activeQuiz) {
        setScreenBlurred(true);
        toast.error('Please stay on the quiz tab!');
      } else {
        setTimeout(() => setScreenBlurred(false), 1500);
      }
    };

    const handleBlur = () => {
      if (activeQuiz) {
        setScreenBlurred(true);
      }
    };
    const handleFocus = () => {
      setTimeout(() => setScreenBlurred(false), 1000);
    };

    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keyup', preventPrintScreen);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keyup', preventPrintScreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [activeQuiz]);

  const handleVerifyPassword = async (quizId) => {
    if (!passwordInput.trim()) {
      toast.error('Enter the quiz password');
      return;
    }
    setVerifying(true);
    try {
      const response = await axios.post(`/quizzes/${quizId}/verify-password`, {
        password: passwordInput,
      });
      setActiveQuiz(response.data);
      setAnswers(new Array(response.data.questions.length).fill(-1));
      setSelectedQuizId(null);
      setPasswordInput('');
      toast.success('Access granted! Quiz started.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Incorrect password');
    } finally {
      setVerifying(false);
    }
  };

  const handleSelectAnswer = (qIndex, optionIndex) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[qIndex] = optionIndex;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a === -1).length;
    if (unanswered > 0) {
      const ok = await confirm({
        title: 'Submit with unanswered questions?',
        message: `You still have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Unanswered questions count as incorrect.`,
        confirmLabel: 'Submit anyway',
        cancelLabel: 'Keep answering',
        tone: 'danger',
      });
      if (!ok) return;
    }
    await handleAutoSubmit();
  };

  const handleReviewQuiz = async (quizId) => {
    setReviewLoading(true);
    try {
      const res = await axios.get(`/quizzes/${quizId}/preview`);
      setReviewData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load quiz review');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Show result after submission
  if (result) {
    return (
      <div className="animate-fade-in-up max-w-lg mx-auto mt-12">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-100 border border-primary-300 flex items-center justify-center">
            <span className="font-serif text-2xl font-semibold text-primary-900">{result.percentage}%</span>
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">Quiz Completed!</h2>
          <p className="text-surface-500 mb-4">
            You scored <span className="font-bold text-primary-600">{result.score}</span> out of{' '}
            <span className="font-bold">{result.totalQuestions}</span>
          </p>
          <div className="flex justify-center gap-3">
            <span
              className={`badge-${result.percentage >= 50 ? 'green' : 'red'} text-base !px-4 !py-2`}
            >
              {result.percentage >= 80
                ? 'Excellent!'
                : result.percentage >= 50
                  ? 'Passed'
                  : 'Needs Improvement'}
            </span>
          </div>
          <button
            onClick={() => {
              setResult(null);
              fetchQuizzes();
            }}
            className="btn-primary mt-6"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => handleReviewQuiz(result.quizId || result._quizId)}
            disabled={reviewLoading}
            className="btn-secondary mt-3 ml-3"
          >
            {reviewLoading ? 'Loading...' : 'Review Answers'}
          </button>
        </div>
      </div>
    );
  }

  // Show review view
  if (reviewData) {
    return (
      <div className="animate-fade-in-up max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{reviewData.quizTitle}</h1>
            <p className="text-surface-500 text-sm mt-1">
              Score: <span className="font-semibold text-primary-700">{reviewData.score}/{reviewData.totalQuestions}</span>
              {' '}({reviewData.percentage}%)
            </p>
          </div>
          <button onClick={() => setReviewData(null)} className="btn-secondary">
            Back
          </button>
        </div>
        <div className="space-y-4">
          {reviewData.questions.map((q, i) => (
            <div key={q._id || i} className={`card p-5 border-l-4 ${q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className={`badge ${q.isCorrect ? 'badge-green' : 'badge-red'}`}>Q{i + 1}</span>
                <p className="text-surface-800 font-medium">{q.question}</p>
              </div>
              <div className="space-y-2 ml-8">
                {q.options.map((opt, oIndex) => {
                  const isUserAnswer = q.userAnswer === oIndex;
                  const isCorrect = q.correctAnswer === oIndex;
                  let classes = 'border bg-surface-50 border-surface-200';
                  if (isCorrect) classes = 'border-2 bg-green-50 border-green-400';
                  else if (isUserAnswer && !isCorrect) classes = 'border-2 bg-red-50 border-red-400';
                  return (
                    <div key={oIndex} className={`flex items-center gap-3 p-3 rounded-xl ${classes}`}>
                      {isCorrect && (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isUserAnswer && !isCorrect && (
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      {!isCorrect && !isUserAnswer && <span className="w-5 h-5 flex-shrink-0" />}
                      <span className={`text-sm ${isCorrect ? 'text-green-800 font-medium' : isUserAnswer ? 'text-red-800 font-medium' : 'text-surface-700'}`}>
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <button onClick={() => setReviewData(null)} className="btn-primary">
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // Active quiz — taking the quiz
  if (activeQuiz) {
    return (
      <div
        className="animate-fade-in-up relative"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Screenshot / blur overlay */}
        {screenBlurred && (
          <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <p className="text-white text-xl font-bold">Screenshots Not Allowed</p>
              <p className="text-surface-400 text-sm mt-2">Return to the quiz tab to continue</p>
            </div>
          </div>
        )}

        {/* Header with timer */}
        <div className="sticky top-0 z-20 bg-white border-b border-surface-200 p-4 mb-6 shadow-soft">
          <div className="flex justify-between items-center max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-surface-900">{activeQuiz.title}</h2>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-mono text-lg font-semibold tabular-nums ${timeLeft <= 60 ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-primary-100 text-primary-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-5">
          {activeQuiz.questions.map((q, qIndex) => (
            <div
              key={q._id}
              className={`card p-5 transition-all duration-200 ${answers[qIndex] !== -1 ? 'border-l-4 border-l-primary-500' : ''}`}
            >
              <div className="flex items-start space-x-3 mb-4">
                <span className="badge-blue flex-shrink-0">Q{qIndex + 1}</span>
                <p className="text-surface-800 font-medium">{q.question}</p>
              </div>
              <div className="space-y-2 ml-8">
                {q.options.map((opt, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                      answers[qIndex] === oIndex
                        ? 'bg-primary-50 border-primary-300 shadow-sm'
                        : 'bg-surface-50 border-surface-200 hover:bg-surface-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`quiz-q-${qIndex}`}
                      checked={answers[qIndex] === oIndex}
                      onChange={() => handleSelectAnswer(qIndex, oIndex)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-surface-700">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center py-6">
            <p className="text-sm text-surface-400">
              {answers.filter((a) => a !== -1).length}/{activeQuiz.questions.length} answered
            </p>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz list
  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Quizzes</h1>
        <p className="text-surface-500 text-sm mt-1">Enter password to access a quiz</p>
      </div>

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
          <p className="text-surface-600 mb-1 font-medium">No quizzes available</p>
          <p className="text-surface-400 text-sm">Check back later for new quizzes</p>
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
                      Conducted by:{' '}
                      <span className="font-medium text-surface-700">{quiz.createdBy.name}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="badge-blue">
                      {quiz.totalQuestions || quiz.questions?.length || '?'} Questions
                    </span>
                    <span className="badge-purple">{quiz.duration} min</span>
                    <span className="text-surface-400 text-xs">
                      Expires: {new Date(quiz.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex items-center">
                  {quiz.attempted ? (
                    <div className="text-center">
                      <span
                        className={`badge-${quiz.score !== null && quiz.totalQuestions && quiz.score / quiz.totalQuestions >= 0.5 ? 'green' : 'red'}`}
                      >
                        Score: {quiz.score}/{quiz.totalQuestions}
                      </span>
                      <p className="text-xs text-surface-400 mt-1">Completed</p>
                      <button
                        onClick={() => handleReviewQuiz(quiz._id)}
                        disabled={reviewLoading}
                        className="btn-ghost text-xs mt-1 !py-1 !px-2 text-primary-700"
                      >
                        Review
                      </button>
                    </div>
                  ) : selectedQuizId === quiz._id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword(quiz._id)}
                        placeholder="Password"
                        className="input-modern !py-2 !px-3 w-36 text-sm"
                        autoFocus
                      />
                      <button
                        onClick={() => handleVerifyPassword(quiz._id)}
                        disabled={verifying}
                        className="btn-primary !py-2 !px-3 text-sm"
                      >
                        {verifying ? '...' : 'Go'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuizId(null);
                          setPasswordInput('');
                        }}
                        className="text-surface-400 hover:text-surface-600 p-1"
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
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedQuizId(quiz._id)}
                      className="btn-primary !py-2 !px-4 text-sm"
                    >
                      Start Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentQuiz;
