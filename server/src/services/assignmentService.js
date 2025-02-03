export const verifySolution = (storedSolution, studentAnswer) => {
  // Parse solutions if they're strings
  const parsedStored = typeof storedSolution === 'string' 
    ? JSON.parse(storedSolution) 
    : storedSolution;
    
  const parsedAnswer = typeof studentAnswer === 'string'
    ? studentAnswer
    : studentAnswer.answer;

  // Normalize both answers (remove spaces, convert to lowercase)
  const normalizeAnswer = (answer) => answer.replace(/\s+/g, '').toLowerCase();
  
  // Get the correct answer format from stored solution
  const correctAnswer = parsedStored.answer || 
    `x=${parsedStored.final_answers.x},y=${parsedStored.final_answers.y}`;

  return normalizeAnswer(parsedAnswer) === normalizeAnswer(correctAnswer);
}; 