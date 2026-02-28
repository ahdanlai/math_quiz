const { MathQuestionGenerator, Operator } = require('../../main/js/core/MathQuestionGenerator');

function testMathQuestionGenerator() {
  const generator = new MathQuestionGenerator();
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

  // Test Addition
  const additionQ = generator.generateQuestion(Operator.ADD, 'EASY');
  assert(
    additionQ.operand1 + additionQ.operand2 === additionQ.answer,
    `Addition: ${additionQ.text} (Expected: ${additionQ.answer})`
  );

  // Test Subtraction (Ensure non-negative)
  const subtractionQ = generator.generateQuestion(Operator.SUBTRACT, 'EASY');
  assert(
    subtractionQ.operand1 - subtractionQ.operand2 === subtractionQ.answer,
    `Subtraction: ${subtractionQ.text} (Expected: ${subtractionQ.answer})`
  );
  assert(subtractionQ.answer >= 0, 'Subtraction: Answer is non-negative');

  // Test Multiplication
  const multiplicationQ = generator.generateQuestion(Operator.MULTIPLY, 'MEDIUM');
  assert(
    multiplicationQ.operand1 * multiplicationQ.operand2 === multiplicationQ.answer,
    `Multiplication: ${multiplicationQ.text} (Expected: ${multiplicationQ.answer})`
  );

  // Test Division (Ensure integer results)
  const divisionQ = generator.generateQuestion(Operator.DIVIDE, 'HARD');
  assert(
    divisionQ.operand1 / divisionQ.operand2 === divisionQ.answer,
    `Division: ${divisionQ.text} (Expected: ${divisionQ.answer})`
  );
  assert(Number.isInteger(divisionQ.answer), 'Division: Answer is an integer');

  console.log(`
Tests Summary: ${testsPassed}/${totalTests} passed.`);
  
  if (testsPassed !== totalTests) {
    process.exit(1);
  }
}

testMathQuestionGenerator();
