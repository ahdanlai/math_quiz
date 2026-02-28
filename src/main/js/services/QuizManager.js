/**
 * Service to manage the lifecycle of a math quiz.
 * Handles scoring, question progression, and quiz state.
 */

const { MathQuestionGenerator, Operator } = require('../core/MathQuestionGenerator');

class QuizManager {
  /**
   * @param {object} config - Quiz configuration.
   * @param {number} config.questionCount - Total questions in the quiz.
   * @param {string} config.difficulty - 'EASY', 'MEDIUM', 'HARD'.
   * @param {string[]} config.operators - Array of allowed operators.
   */
  constructor(config = {}) {
    this.generator = new MathQuestionGenerator();
    this.questionCount = config.questionCount || 10;
    this.difficulty = config.difficulty || 'EASY';
    this.operators = config.operators || [Operator.ADD, Operator.SUBTRACT];
    
    this.reset();
  }

  /**
   * Resets the quiz state.
   */
  reset() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
    this.isFinished = false;
  }

  /**
   * Starts a new quiz session.
   * @returns {object} The first question.
   */
  start() {
    this.reset();
    return this.nextQuestion();
  }

  /**
   * Generates and returns the next question.
   * @returns {object|null} Next question or null if finished.
   */
  nextQuestion() {
    if (this.currentQuestionIndex >= this.questionCount) {
      this.isFinished = true;
      return null;
    }

    const randomOperator = this.operators[Math.floor(Math.random() * this.operators.length)];
    const question = this.generator.generateQuestion(randomOperator, this.difficulty);
    
    this.questions.push({
      ...question,
      userAnswer: null,
      isCorrect: null,
      timestamp: Date.now()
    });

    return question;
  }

  /**
   * Submits an answer for the current question.
   * @param {number} answer - User's answer.
   * @returns {object} Result of the submission { isCorrect, correctAnswer, nextQuestion }.
   */
  submitAnswer(answer) {
    if (this.isFinished) throw new Error("Quiz is already finished.");

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const isCorrect = parseInt(answer) === currentQuestion.answer;

    currentQuestion.userAnswer = answer;
    currentQuestion.isCorrect = isCorrect;

    if (isCorrect) {
      this.score++;
    }

    this.currentQuestionIndex++;
    const next = this.nextQuestion();

    return {
      isCorrect,
      correctAnswer: currentQuestion.answer,
      nextQuestion: next,
      isFinished: this.isFinished
    };
  }

  /**
   * Returns final quiz results.
   * @returns {object} { score, total, percentage, history }
   */
  getSummary() {
    return {
      score: this.score,
      total: this.questionCount,
      percentage: (this.score / this.questionCount) * 100,
      history: this.questions
    };
  }
}

module.exports = { QuizManager };
