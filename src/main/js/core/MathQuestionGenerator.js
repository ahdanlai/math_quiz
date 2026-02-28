/**
 * Core logic for generating math questions for the Math Quiz APP.
 * Supports addition, subtraction, multiplication, and division.
 * Difficulty levels affect the range of numbers used.
 */

const Difficulty = {
  EASY: { min: 1, max: 10 },
  MEDIUM: { min: 1, max: 50 },
  HARD: { min: 1, max: 100 },
};

const Operator = {
  ADD: '+',
  SUBTRACT: '-',
  MULTIPLY: '*',
  DIVIDE: '/',
};

class MathQuestionGenerator {
  /**
   * Generates a random integer between min and max (inclusive).
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a math question based on the operator and difficulty.
   * @param {string} operator - The type of operation ('+', '-', '*', '/').
   * @param {string} difficulty - Difficulty level ('EASY', 'MEDIUM', 'HARD').
   * @returns {object} { operand1, operand2, operator, answer }
   */
  generateQuestion(operator, difficulty = 'EASY') {
    const limits = Difficulty[difficulty.toUpperCase()] || Difficulty.EASY;
    let operand1, operand2, answer;

    switch (operator) {
      case Operator.ADD:
        operand1 = this.getRandomInt(limits.min, limits.max);
        operand2 = this.getRandomInt(limits.min, limits.max);
        answer = operand1 + operand2;
        break;

      case Operator.SUBTRACT:
        operand1 = this.getRandomInt(limits.min, limits.max);
        operand2 = this.getRandomInt(limits.min, operand1); // Ensure non-negative answer
        answer = operand1 - operand2;
        break;

      case Operator.MULTIPLY:
        operand1 = this.getRandomInt(limits.min, Math.sqrt(limits.max));
        operand2 = this.getRandomInt(limits.min, Math.sqrt(limits.max));
        answer = operand1 * operand2;
        break;

      case Operator.DIVIDE:
        // Ensure integer results by multiplying two random numbers to get the dividend
        operand2 = this.getRandomInt(limits.min, Math.sqrt(limits.max));
        answer = this.getRandomInt(limits.min, Math.sqrt(limits.max));
        operand1 = operand2 * answer;
        break;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }

    return {
      operand1,
      operand2,
      operator,
      answer,
      text: `${operand1} ${operator} ${operand2} = ?`,
    };
  }
}

module.exports = {
  MathQuestionGenerator,
  Difficulty,
  Operator,
};
