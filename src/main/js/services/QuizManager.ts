/**
 * Service to manage the lifecycle of a math quiz.
 * Handles scoring, question progression, and quiz state.
 */

import { MathQuestionGenerator, Operator } from '../core/MathQuestionGenerator';

export interface QuizConfig {
  questionCount?: number;
  difficulty?: string;
  operators?: string[];
}

export interface QuestionInstance {
  operand1: number;
  operand2: number;
  operator: string;
  answer: number;
  text: string;
  userAnswer: number | null;
  isCorrect: boolean | null;
  timestamp: number;
}

export class QuizManager {
  private generator: MathQuestionGenerator;
  public questionCount: number;
  public difficulty: string;
  public operators: string[];
  public currentQuestionIndex: number = 0;
  public score: number = 0;
  public questions: QuestionInstance[] = [];
  public isFinished: boolean = false;

  constructor(config: QuizConfig = {}) {
    this.generator = new MathQuestionGenerator();
    this.questionCount = config.questionCount || 10;
    this.difficulty = config.difficulty || 'EASY';
    this.operators = config.operators || [Operator.ADD, Operator.SUBTRACT];
    
    this.reset();
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.questions = [];
    this.isFinished = false;
  }

  start() {
    this.reset();
    return this.nextQuestion();
  }

  nextQuestion() {
    if (this.currentQuestionIndex >= this.questionCount) {
      this.isFinished = true;
      return null;
    }

    const randomOperator = this.operators[Math.floor(Math.random() * this.operators.length)];
    const question = this.generator.generateQuestion(randomOperator, this.difficulty);
    
    const instance: QuestionInstance = {
      ...question,
      userAnswer: null,
      isCorrect: null,
      timestamp: Date.now()
    };

    this.questions.push(instance);
    return instance;
  }

  submitAnswer(answer: number) {
    if (this.isFinished) throw new Error("Quiz is already finished.");

    const currentQuestion = this.questions[this.currentQuestionIndex];
    const isCorrect = answer === currentQuestion.answer;

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

  getSummary() {
    return {
      score: this.score,
      total: this.questionCount,
      percentage: (this.score / this.questionCount) * 100,
      history: this.questions
    };
  }
}
