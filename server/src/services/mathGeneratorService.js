const generateLinearEquation = (difficulty) => {
  // Generate coefficients based on difficulty (1-10)
  const maxCoefficient = Math.min(difficulty * 2, 10);
  const a = Math.floor(Math.random() * maxCoefficient) + 1;
  const b = Math.floor(Math.random() * maxCoefficient) + 1;
  const c = Math.floor(Math.random() * (maxCoefficient * 5)) + 1;

  const solution = {
    x: (c - b) / a,
    y: null
  };

  return {
    title: 'משוואה לינארית',
    description: 'פתור את המשוואה הבאה:',
    equation: `${a}x + ${b} = ${c}`,
    solution: {
      steps: [
        `נחסר ${b} משני האגפים: ${a}x = ${c - b}`,
        `נחלק ב-${a} את שני האגפים: x = ${solution.x}`
      ],
      answer: `x=${solution.x}`,
      final_answers: {
        x: solution.x.toString(),
        y: ''
      }
    },
    hints: [
      'העבר את כל האיברים שאינם מכילים x לאגף השני',
      'חלק את שני האגפים במקדם של x'
    ]
  };
};

const generateQuadraticEquation = (difficulty) => {
  // Generate coefficients based on difficulty (1-10)
  const a = Math.floor(Math.random() * 2) + 1;
  const b = Math.floor(Math.random() * (difficulty * 2)) + 1;
  const c = Math.floor(Math.random() * difficulty) + 1;

  // Calculate solutions using quadratic formula
  const discriminant = b * b - 4 * a * c;
  const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);

  return {
    title: 'משוואה ריבועית',
    description: 'פתור את המשוואה הריבועית הבאה:',
    equation: `${a}x² + ${b}x + ${c} = 0`,
    solution: {
      steps: [
        `נשתמש בנוסחה הריבועית: x = (-b ± √(b² - 4ac)) / 2a`,
        `נציב את הערכים: a=${a}, b=${b}, c=${c}`,
        `מחשבים את הדיסקרימיננטה: b² - 4ac = ${discriminant}`,
        `x₁ = ${x1}`,
        `x₂ = ${x2}`
      ],
      answer: `x₁=${x1}, x₂=${x2}`,
      final_answers: {
        x: x1.toString(),
        y: x2.toString()
      }
    },
    hints: [
      'השתמש בנוסחה הריבועית',
      'חשב קודם את הדיסקרימיננטה',
      'זכור שיש שני פתרונות אפשריים'
    ]
  };
};

const generateGeometryQuestion = (difficulty) => {
  // Generate a right triangle with integer sides
  const base = Math.floor(Math.random() * (difficulty * 2)) + 2;
  const height = Math.floor(Math.random() * (difficulty * 2)) + 2;
  const hypotenuse = Math.sqrt(base * base + height * height);
  const area = (base * height) / 2;

  return {
    title: 'חישוב שטח משולש',
    description: `חשב את שטח המשולש ישר הזווית עם ניצבים באורך ${base} ו-${height}`,
    equation: `A = (a × h) / 2`,
    solution: {
      steps: [
        `נשתמש בנוסחת שטח משולש: A = (a × h) / 2`,
        `נציב את הערכים: A = (${base} × ${height}) / 2`,
        `נחשב: A = ${area}`
      ],
      answer: area.toString(),
      final_answers: {
        x: area.toString(),
        y: ''
      }
    },
    hints: [
      'השתמש בנוסחת שטח משולש',
      'הכפל את אורך הבסיס בגובה',
      'חלק את התוצאה ב-2'
    ]
  };
};

export const generateMathQuestion = async (topic, difficulty) => {
  try {
    // Normalize topic to match our internal mapping
    const normalizedTopic = topic.toLowerCase().replace(/[^a-z_]/g, '');
    
    // Map external topic names to internal ones
    const topicMap = {
      'linear_equations': 'linear_equations',
      'quadratic_equations': 'quadratic_equations',
      'geometry': 'geometry',
      'equations': 'linear_equations',
      'trigonometry': 'geometry',
      'vectors': 'linear_equations',
      'complex': 'linear_equations',
      'calculus': 'quadratic_equations',
      'sequences': 'linear_equations',
      'probability': 'linear_equations'
    };

    const mappedTopic = topicMap[normalizedTopic];
    
    if (!mappedTopic) {
      console.log('Unsupported topic requested:', topic);
      console.log('Available topics:', Object.keys(topicMap));
      throw new Error(`Unsupported topic: ${topic}`);
    }

    // Map difficulty from 1-10 scale to 1-5 scale
    const normalizedDifficulty = Math.ceil((difficulty / 10) * 5);

    switch (mappedTopic) {
      case 'linear_equations':
        return generateLinearEquation(normalizedDifficulty);
      case 'quadratic_equations':
        return generateQuadraticEquation(normalizedDifficulty);
      case 'geometry':
        return generateGeometryQuestion(normalizedDifficulty);
      default:
        throw new Error('Unsupported topic');
    }
  } catch (error) {
    console.error('Error generating math question:', error);
    throw error;
  }
};

export const generateAssignmentWithAI = async (topic, difficulty) => {
  try {
    // Use the existing generateMathQuestion function
    const question = await generateMathQuestion(topic, difficulty);
    
    // Format the question to match the assignment schema
    return {
      title: question.title,
      description: question.description,
      equation: question.equation,
      hints: question.hints,
      solution: {
        steps: question.solution.steps,
        final_answers: question.solution.final_answers
      }
    };
  } catch (error) {
    console.error('Error generating assignment with AI:', error);
    throw error;
  }
}; 