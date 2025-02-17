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

  // Different formulations for linear equations
  const formulations = [
    {
      title: 'משוואה לינארית',
      description: 'פתור את המשוואה הבאה:',
      equation: `${a}x + ${b} = ${c}`
    },
    {
      title: 'משוואה בנעלם אחד',
      description: 'מצא את ערך x במשוואה:',
      equation: `${a}x = ${c} - ${b}`
    },
    {
      title: 'משוואה מהמעלה הראשונה',
      description: 'פתור ומצא את x:',
      equation: `${b} + ${a}x = ${c}`
    }
  ];

  const selectedForm = formulations[Math.floor(Math.random() * formulations.length)];

  return {
    ...selectedForm,
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
      'חלק את שני האגפים במקדם של x',
      'בדוק את התשובה על ידי הצבה במשוואה המקורית'
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

  // Different formulations for quadratic equations
  const formulations = [
    {
      title: 'משוואה ריבועית',
      description: 'פתור את המשוואה הריבועית הבאה:',
      equation: `${a}x² + ${b}x + ${c} = 0`
    },
    {
      title: 'שורשי משוואה ריבועית',
      description: 'מצא את שורשי המשוואה:',
      equation: `${a}x² + ${b}x = ${-c}`
    },
    {
      title: 'פתרון משוואה מהמעלה השנייה',
      description: 'פתור ומצא את ערכי x במשוואה:',
      equation: `${a}(x²) + ${b}x + ${c} = 0`
    },
    {
      title: 'נקודות חיתוך עם ציר x',
      description: 'מצא את נקודות החיתוך של הפונקציה הריבועית עם ציר x:',
      equation: `f(x) = ${a}x² + ${b}x + ${c}`
    }
  ];

  const selectedForm = formulations[Math.floor(Math.random() * formulations.length)];

  return {
    ...selectedForm,
    solution: {
      steps: [
        `נשתמש בנוסחה הריבועית: x = (-b ± √(b² - 4ac)) / 2a`,
        `נציב את הערכים: a=${a}, b=${b}, c=${c}`,
        `מחשבים את הדיסקרימיננטה: b² - 4ac = ${discriminant}`,
        `x₁ = (-${b} + √${discriminant}) / ${2*a} = ${x1}`,
        `x₂ = (-${b} - √${discriminant}) / ${2*a} = ${x2}`
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
      'זכור שיש שני פתרונות כאשר הדיסקרימיננטה חיובית',
      'בדוק את התשובות על ידי הצבה במשוואה המקורית'
    ]
  };
};

const generateGeometryQuestion = (difficulty) => {
  // Generate a right triangle with integer sides
  const base = Math.floor(Math.random() * (difficulty * 2)) + 2;
  const height = Math.floor(Math.random() * (difficulty * 2)) + 2;
  const hypotenuse = Math.sqrt(base * base + height * height);
  const area = (base * height) / 2;

  // Different formulations for geometry questions
  const formulations = [
    {
      title: 'חישוב שטח משולש',
      description: `חשב את שטח המשולש ישר הזווית עם ניצבים באורך ${base} ו-${height}`,
      equation: `A = (a × h) / 2`
    },
    {
      title: 'שטח משולש ישר זווית',
      description: `משולש ישר זווית שאורכי ניצביו הם ${base} ו-${height}. מהו שטח המשולש?`,
      equation: `A = ?`
    },
    {
      title: 'גיאומטריה - שטח משולש',
      description: `נתון משולש ישר זווית. אורך הניצב הראשון הוא ${base} ואורך הניצב השני הוא ${height}. חשב את שטח המשולש.`,
      equation: `A = ½ × בסיס × גובה`
    }
  ];

  const selectedForm = formulations[Math.floor(Math.random() * formulations.length)];

  return {
    ...selectedForm,
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

const generateSequenceQuestion = (difficulty) => {
  // Generate a sequence question based on difficulty
  const length = Math.floor(Math.random() * (difficulty * 5)) + 5;
  const sequence = Array.from({ length }, (_, i) => i + 1);

  // Different formulations for sequence questions
  const formulations = [
    {
      title: 'סדרה חשבונית',
      description: `מצא את האיבר ה-${length} בסדרה הבאה: ${sequence.slice(0, 5).join(', ')}...`,
      equation: `a_${length} = ?`
    },
    {
      title: 'המשך הסדרה',
      description: `בסדרה הבאה: ${sequence.slice(0, 5).join(', ')}..., מהו האיבר במקום ה-${length}?`,
      equation: `a_n = ?`
    },
    {
      title: 'איבר בסדרה',
      description: `נתונה סדרה חשבונית שמתחילה ב-1 עם הפרש 1. מצא את האיבר במקום ה-${length}.`,
      equation: `a_n = a₁ + (n-1)d`
    }
  ];

  const selectedForm = formulations[Math.floor(Math.random() * formulations.length)];

  return {
    ...selectedForm,
    solution: {
      steps: [
        `הסדרה היא סדרה חשבונית עם איבר ראשון a₁ = 1`,
        `ההפרש בין איברים עוקבים הוא d = 1`,
        `נשתמש בנוסחה: a_n = a₁ + (n-1)d`,
        `נציב: a_${length} = 1 + (${length}-1) × 1 = ${sequence[length-1]}`
      ],
      answer: sequence[length-1].toString(),
      final_answers: {
        x: sequence[length-1].toString(),
        y: ''
      }
    },
    hints: [
      'זהה את סוג הסדרה (חשבונית)',
      'מצא את ההפרש בין איברים עוקבים',
      'השתמש בנוסחת האיבר הכללי בסדרה חשבונית'
    ]
  };
};

const generateProbabilityQuestion = (difficulty) => {
  // Generate a probability question based on difficulty
  const total = Math.floor(Math.random() * (difficulty * 10)) + 10;
  const favorable = Math.floor(Math.random() * total) + 1;
  
  // Different formulations for probability questions
  const formulations = {
    marbles: [
      `בכד יש ${total} גולות, מתוכן ${favorable} גולות אדומות. מה ההסתברות לשלוף גולה אדומה?`,
      `בשקית יש ${total} גולות בצבעים שונים. ${favorable} מהן אדומות. מהי ההסתברות להוציא גולה אדומה?`,
      `מתוך ${total} גולות בקופסה, ${favorable} הן אדומות. חשב את ההסתברות לבחור גולה אדומה באקראי.`
    ],
    cards: [
      `בחפיסת קלפים יש ${total} קלפים, מתוכם ${favorable} קלפים אדומים. מה ההסתברות לשלוף קלף אדום?`,
      `בערימת קלפים יש ${total} קלפים. ${favorable} מהקלפים הם בצבע אדום. מהי ההסתברות לבחור קלף אדום?`,
      `מתוך ${total} קלפים, ${favorable} הם אדומים. חשב את ההסתברות לשליפת קלף אדום.`
    ],
    students: [
      `בכיתה יש ${total} תלמידים, מתוכם ${favorable} משתתפים בחוג מתמטיקה. מה ההסתברות לבחור תלמיד שמשתתף בחוג?`,
      `מתוך ${total} תלמידים בבית הספר, ${favorable} לומדים מתמטיקה מוגברת. מהי ההסתברות לבחור תלמיד שלומד מתמטיקה מוגברת?`,
      `בקבוצת לימוד יש ${total} תלמידים. ${favorable} מהם קיבלו ציון מעל 90. חשב את ההסתברות לבחור תלמיד שקיבל מעל 90.`
    ]
  };

  // Choose random scenario and formulation
  const scenarios = Object.keys(formulations);
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const formulation = formulations[scenario][Math.floor(Math.random() * formulations[scenario].length)];
  
  return {
    title: 'הסתברות',
    description: formulation,
    equation: `P(הצלחה) = ?`,
    solution: {
      steps: [
        `נחשב את ההסתברות: ${favorable}/${total} = ${favorable/total}`,
        `נציב את הערכים: מספר המקרים הרצויים = ${favorable}, מספר המקרים האפשריים = ${total}`,
        `נחשב את ההסתברות: ${favorable}/${total} = ${(favorable/total).toFixed(3)}`
      ],
      answer: `${(favorable/total).toFixed(3)}`,
      final_answers: {
        probability: (favorable/total).toFixed(3)
      }
    },
    hints: [
      'השתמש בנוסחת ההסתברות: מספר המקרים הרצויים חלקי מספר המקרים האפשריים',
      'מספר המקרים הרצויים הוא מספר הפריטים המבוקשים',
      'מספר המקרים האפשריים הוא סך כל הפריטים'
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
      'sequences': 'sequences',
      'probability': 'probability'
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
      case 'probability':
        return generateProbabilityQuestion(normalizedDifficulty);
      case 'sequences':
        return generateSequenceQuestion(normalizedDifficulty);
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