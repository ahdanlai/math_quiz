import { useState, useEffect, useMemo } from 'react';
import { QuizManager } from './services/QuizManager';
import { Operator } from './core/MathQuestionGenerator';
import './App.css';

type QuizState = 'IDLE' | 'ACTIVE' | 'FINISHED';

function App() {
  const [state, setState] = useState<QuizState>('IDLE');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  
  const quizManager = useMemo(() => new QuizManager({
    questionCount: 5,
    difficulty: 'EASY',
    operators: [Operator.ADD, Operator.SUBTRACT]
  }), []);

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
            <p>Ready to test your math skills?</p>
            <button className="btn-primary" onClick={handleStart}>Start Quiz!</button>
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
