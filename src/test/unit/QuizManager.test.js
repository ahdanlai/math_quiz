const { QuizManager } = require('../../main/js/services/QuizManager');
const { Operator } = require('../../main/js/core/MathQuestionGenerator');

function testQuizManager() {
  console.log("Running QuizManager Tests...");
  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      testsPassed++;
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  const quiz = new QuizManager({
    questionCount: 3,
    difficulty: 'EASY',
    operators: [Operator.ADD]
  });

  // Test 1: Start Quiz
  const q1 = quiz.start();
  assert(q1 !== null && typeof q1 === 'object', "Quiz starts and returns first question");
  assert(quiz.currentQuestionIndex === 0, "Current index is 0 at start");

  // Test 2: Submit Correct Answer
  const result1 = quiz.submitAnswer(q1.answer);
  assert(result1.isCorrect === true, `Correct answer submission (Expected: ${q1.answer})`);
  assert(quiz.score === 1, "Score increases with correct answer");
  assert(quiz.currentQuestionIndex === 1, "Current index advances to 1");

  // Test 3: Submit Incorrect Answer
  const q2 = result1.nextQuestion;
  const wrongAnswer = q2.answer + 1;
  const result2 = quiz.submitAnswer(wrongAnswer);
  assert(result2.isCorrect === false, `Incorrect answer submission (Input: ${wrongAnswer}, Expected: ${q2.answer})`);
  assert(quiz.score === 1, "Score remains same with incorrect answer");
  assert(quiz.currentQuestionIndex === 2, "Current index advances to 2");

  // Test 4: Finish Quiz
  const q3 = result2.nextQuestion;
  const result3 = quiz.submitAnswer(q3.answer);
  assert(result3.isFinished === true, "Quiz is finished after last question");
  assert(result3.nextQuestion === null, "Next question is null after finishing");

  // Test 5: Summary
  const summary = quiz.getSummary();
  assert(summary.score === 2, "Summary score is 2");
  assert(summary.total === 3, "Summary total is 3");
  assert(summary.history.length === 3, "History includes all questions");

  console.log(`
Tests Summary: ${testsPassed}/${totalTests} passed.`);
  
  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

testQuizManager();
