import { useState, useEffect, useMemo, useRef } from 'react';
import { QuizManager } from './services/QuizManager';
import { Operator } from './core/MathQuestionGenerator';
import './App.css';

type QuizState = 'IDLE' | 'ACTIVE' | 'FINISHED';

function App() {
  const [state, setState] = useState<QuizState>('IDLE');
  const [difficulty, setDifficulty] = useState('EASY');
  const [operators, setOperators] = useState<string[]>([Operator.ADD, Operator.SUBTRACT]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state === 'ACTIVE' && !feedback && inputRef.current) {
      // Small timeout ensures the DOM has updated and input is no longer disabled
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [currentQuestion, feedback, state]);
  
  const quizManager = useMemo(() => new QuizManager({
    questionCount: 5,
    difficulty: difficulty,
    operators: operators
  }), [difficulty, operators]);

  const toggleOperator = (op: string) => {
    if (operators.includes(op) && operators.length === 1) return; // Must have at least one operator
    setOperators(prev => 
      prev.includes(op) ? prev.filter(o => o !== op) : [...prev, op]
    );
  };

  const handleStart = () => {
    const firstQ = quizManager.start();
    setCurrentQuestion(firstQ);
    setState('ACTIVE');
    setFeedback(null);
    setUserAnswer('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer) return;

    const result = quizManager.submitAnswer(parseInt(userAnswer));
    setFeedback({
      isCorrect: result.isCorrect,
      message: result.isCorrect ? '🌟 Correct!' : `❌ Oops! It was ${result.correctAnswer}`
    });

    setTimeout(() => {
      if (result.isFinished) {
        setState('FINISHED');
      } else {
        setCurrentQuestion(result.nextQuestion);
        setUserAnswer('');
        setFeedback(null);
      }
    }, 1500);
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
            <div className="progress">
              Question {quizManager.currentQuestionIndex + 1} of {quizManager.questionCount}
            </div>
            <div className="question-text">
              {currentQuestion.operand1} {currentQuestion.operator} {currentQuestion.operand2} = ?
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
            <h2>Quiz Complete!</h2>
            <div className="score-display">
              <span className="final-score">{quizManager.score}</span> / {quizManager.questionCount}
            </div>
            <p>{quizManager.score === quizManager.questionCount ? "🥇 Perfect Score! You're a math wizard!" : 'Great job! Keep practicing!'}</p>
            <button className="btn-primary" onClick={handleStart}>Play Again</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
