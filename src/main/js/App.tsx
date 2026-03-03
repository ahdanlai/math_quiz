import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { QuizManager } from './services/QuizManager';
import type { QuestionInstance } from './services/QuizManager';
import { Operator } from './core/MathQuestionGenerator';
import './App.css';

type QuizState = 'IDLE' | 'ACTIVE' | 'FINISHED';

interface QuizResult {
  isCorrect: boolean;
  correctAnswer: number;
  nextQuestion: QuestionInstance | null;
  isFinished: boolean;
}

function App() {
  const [state, setState] = useState<QuizState>('IDLE');
  const [difficulty, setDifficulty] = useState('EASY');
  const [operators, setOperators] = useState<string[]>([Operator.ADD, Operator.SUBTRACT]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionInstance | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const quizManager = useMemo(() => new QuizManager({
    questionCount: 5,
    difficulty: difficulty,
    operators: operators
  }), [difficulty, operators]);

  const processNext = useCallback((result: QuizResult) => {
    setTimeout(() => {
      if (result.isFinished) {
        setState('FINISHED');
        setFeedback(null);
      } else {
        setCurrentQuestion(result.nextQuestion);
        setUserAnswer('');
        setFeedback(null);
        setTimeLeft(10);
      }
    }, 1500);
  }, []);

  const handleTimeout = useCallback(() => {
    const result = quizManager.submitAnswer(null); // No answer given
    setFeedback({
      isCorrect: false,
      message: `⏰ Time's up! It was ${result.correctAnswer}`
    });
    processNext(result);
  }, [quizManager, processNext]);

  useEffect(() => {
    if (state === 'ACTIVE' && !feedback && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [currentQuestion, feedback, state]);

  // Timer logic
  useEffect(() => {
    if (state === 'ACTIVE' && !feedback && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !feedback) {
      // Time's up! Submit with no answer.
      handleTimeout();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, feedback, timeLeft, handleTimeout]);
  
  const toggleOperator = (op: string) => {
    if (operators.includes(op) && operators.length === 1) return; // Must have at least one operator
    setOperators(prev => 
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const handleStart = useCallback(() => {
    const firstQ = quizManager.start();
    setCurrentQuestion(firstQ);
    setState('ACTIVE');
    setFeedback(null);
    setUserAnswer('');
    setTimeLeft(10);
  }, [quizManager]);

  const handleQuit = () => {
    setState('IDLE');
    setFeedback(null);
    setUserAnswer('');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer || feedback) return;

    const result = quizManager.submitAnswer(parseInt(userAnswer));
    setFeedback({
      isCorrect: result.isCorrect,
      message: result.isCorrect ? '🌟 Correct!' : `❌ Oops! It was ${result.correctAnswer}`
    });
    processNext(result);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (state === 'IDLE' || state === 'FINISHED') {
          handleStart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleStart]);

  const formatOperator = (op: string) => {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  };

  return (
    <div className="app-container">
      <header>
        <h1>Math Quiz Hero 🏆</h1>
      </header>

      <main className="quiz-card">
        {state === 'IDLE' && (
          <div className="screen start-screen">
            <h2>Select Your Challenge</h2>
            
            <div className="operator-container">
              <span>Select Operations:</span>
              <div className="operator-buttons">
                {[
                  { id: Operator.ADD, label: '+', title: 'Addition' },
                  { id: Operator.SUBTRACT, label: '-', title: 'Subtraction' },
                  { id: Operator.MULTIPLY, label: '×', title: 'Multiplication' },
                  { id: Operator.DIVIDE, label: '÷', title: 'Division' }
                ].map((op) => (
                  <button
                    key={op.id}
                    title={op.title}
                    className={`btn-operator ${operators.includes(op.id) ? 'active' : ''}`}
                    onClick={() => toggleOperator(op.id)}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="difficulty-grid">
              {[
                { id: 'EASY', label: 'Easy', desc: '1 - 10', color: 'green' },
                { id: 'MEDIUM', label: 'Medium', desc: '1 - 50', color: 'orange' },
                { id: 'HARD', label: 'Hard', desc: '1 - 100', color: 'red' }
              ].map((level) => (
                <div
                  key={level.id}
                  className={`difficulty-card ${difficulty === level.id ? 'active' : ''} ${level.color}`}
                  onClick={() => setDifficulty(level.id)}
                >
                  <div className="level-label">{level.label}</div>
                  <div className="level-desc">{level.desc}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary start-btn" onClick={handleStart}>
              Go! 🚀
            </button>
          </div>
        )}

        {state === 'ACTIVE' && currentQuestion && (
          <div className="screen question-screen">
            <div className="screen-header-top">
              <button className="btn-icon" onClick={handleQuit} title="Back to Home">🏠</button>
              <div className={`timer ${timeLeft <= 3 ? 'danger' : ''}`}>
                ⏱️ {timeLeft}s
              </div>
            </div>
            <div className="timer-bar-container">
              <div 
                className={`timer-bar ${timeLeft <= 3 ? 'danger' : ''}`} 
                style={{ width: `${(timeLeft / 10) * 100}%` }}
              ></div>
            </div>
            <div className="progress">
              Question {feedback ? quizManager.currentQuestionIndex : quizManager.currentQuestionIndex + 1} of {quizManager.questionCount}
            </div>
            <div className="question-text">
              {currentQuestion.operand1} {formatOperator(currentQuestion.operator)} {currentQuestion.operand2} = ?
            </div>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
                disabled={!!feedback}
                placeholder="Type your answer"
              />
              <button type="submit" className="btn-submit" disabled={!!feedback}>
                Check
              </button>
            </form>
            {feedback && (
              <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                {feedback.message}
              </div>
            )}
          </div>
        )}

        {state === 'FINISHED' && (
          <div className="screen result-screen">
            <div className="screen-header-top">
              <button className="btn-icon" onClick={handleQuit} title="Back to Home">🏠</button>
            </div>
            <h2>Quiz Complete!</h2>
            <div className="score-display">
              <span className="final-score">{quizManager.score}</span> / {quizManager.questionCount}
            </div>
            <p>{quizManager.score === quizManager.questionCount ? "🥇 Perfect Score! You're a math wizard!" : 'Great job! Keep practicing!'}</p>
            <button className="btn-primary" onClick={handleStart}>Play Again</button>
          </div>
        )}
      </main>

      {(state === 'ACTIVE' || state === 'FINISHED') && quizManager.questions.some(q => q.userAnswer !== null || q.isCorrect !== null) && (
        <div className="history-section">
          <h3>Recent Answers</h3>
          <ul className="history-list">
            {quizManager.questions.filter(q => q.userAnswer !== null || q.isCorrect !== null).map((q, idx) => (
              <li key={idx} className={`history-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="history-question">
                  Q{idx + 1}: {q.operand1} {formatOperator(q.operator)} {q.operand2} = {q.userAnswer === null ? 'no answer' : q.userAnswer}
                </span>
                <span className="history-icon">
                  {q.isCorrect ? '✅' : `❌ (Ans: ${q.answer})`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
