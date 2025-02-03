// Utility functions for generating questions
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateNiceCoefficients = (difficulty) => {
  const baseRange = difficulty * 2;
  const a = getRandomInt(-baseRange, baseRange);
  const b = getRandomInt(-baseRange, baseRange);
  return { a, b };
};

// מאגר השאלות
export const QUESTIONS_BANK = {
  "equations": [
    {
      difficulty: 1,
      generator: () => {
        // Simple system with x=2, y=3
        const x = 2, y = 3;
        return {
          title: "מערכת משוואות קלה",
          description: "פתור את מערכת המשוואות הבאה:",
          equation: `x + y = 5\nx - y = -1`,
          solution: {
            steps: [
              "נחבר את שתי המשוואות כדי לבודד את x",
              "2x = 4",
              "x = 2",
              "נציב x=2 במשוואה הראשונה",
              "2 + y = 5",
              "y = 3"
            ],
            final_answers: { x: "2", y: "3" }
          },
          hints: ["נסה לחבר או לחסר את המשוואות", "שים לב שהמקדמים של x זהים"]
        };
      }
    },
    {
      difficulty: 2,
      generator: () => {
        // System with x=1, y=2 and random coefficients
        const { a, b } = generateNiceCoefficients(2);
        return {
          title: "מערכת משוואות עם מקדמים",
          description: "פתור את מערכת המשוואות הבאה:",
          equation: `${a}x + y = ${a + 2}\n${b}x - y = ${b - 2}`,
          solution: {
            steps: [
              `נחבר את המשוואות כדי להיפטר מ-y`,
              `(${a}+${b})x = ${a + b}`,
              "x = 1",
              "נציב במשוואה הראשונה",
              `${a} + y = ${a + 2}`,
              "y = 2"
            ],
            final_answers: { x: "1", y: "2" }
          },
          hints: ["נסה לבודד את אחד המשתנים", "חפש דרך להיפטר מ-y"]
        };
      }
    }
  ],
  
  "trigonometry": [
    {
      difficulty: 1,
      generator: () => {
        const angle = getRandomInt(1, 4) * 30; // 30, 60, 90, 120 degrees
        return {
          title: "חישוב ערכי פונקציות טריגונומטריות",
          description: `חשב את הערך של sin(${angle}°)`,
          equation: `sin(${angle}°) = ?`,
          solution: {
            steps: [
              "נזכר בערכים המיוחדים של פונקציות טריגונומטריות",
              `sin(${angle}°) = ${Math.sin(angle * Math.PI / 180).toFixed(2)}`
            ],
            final_answers: { x: Math.sin(angle * Math.PI / 180).toFixed(2) }
          },
          hints: ["זכור את המעגל הטריגונומטרי", "חשוב על הזוויות המיוחדות"]
        };
      }
    },
    {
      difficulty: 2,
      generator: () => {
        return {
          title: "פתרון משוואה טריגונומטרית",
          description: "פתור את המשוואה עבור 0° ≤ x < 180°:",
          equation: "sin(2x) = √2/2",
          solution: {
            steps: [
              "sin(2x) = √2/2 => 2x = 45°, 135°",
              "בגלל שביקשו 0° ≤ x < 180°",
              "x = 22.5°, 67.5°"
            ],
            final_answers: { x: "22.5", y: "67.5" }
          },
          hints: [
            "השתמשו בטבלת הערכים המוכרים של סינוס",
            "זכרו שכאשר sin(θ)=√2/2, הזווית יכולה להיות 45° או 135°"
          ]
        };
      }
    }
  ],

  "vectors": [
    {
      difficulty: 1,
      generator: () => {
        const x1 = getRandomInt(-5, 5);
        const y1 = getRandomInt(-5, 5);
        const x2 = getRandomInt(-5, 5);
        const y2 = getRandomInt(-5, 5);
        return {
          title: "חיבור וקטורים",
          description: "חבר את הוקטורים הבאים:",
          equation: `u = (${x1},${y1})\nv = (${x2},${y2})`,
          solution: {
            steps: [
              "נחבר כל רכיב בנפרד",
              `x = ${x1} + ${x2} = ${x1 + x2}`,
              `y = ${y1} + ${y2} = ${y1 + y2}`
            ],
            final_answers: { x: (x1 + x2).toString(), y: (y1 + y2).toString() }
          },
          hints: ["חבר את הרכיבים המתאימים", "x עם x ו-y עם y"]
        };
      }
    },
    {
      difficulty: 2,
      generator: () => {
        const x1 = getRandomInt(-3, 3);
        const y1 = getRandomInt(-3, 3);
        const z1 = getRandomInt(-3, 3);
        const x2 = getRandomInt(-3, 3);
        const y2 = getRandomInt(-3, 3);
        const z2 = getRandomInt(-3, 3);
        const dot = x1*x2 + y1*y2 + z1*z2;
        return {
          title: "מכפלה סקלרית ב-3D",
          description: "חשבו את המכפלה הסקלרית של הוקטורים:",
          equation: `u = <${x1}, ${y1}, ${z1}>,  v = <${x2}, ${y2}, ${z2}>`,
          solution: {
            steps: [
              "u·v = x1*x2 + y1*y2 + z1*z2",
              `= ${x1}*${x2} + ${y1}*${y2} + ${z1}*${z2} = ${dot}`
            ],
            final_answers: { x: dot.toString() }
          },
          hints: [
            "חישוב סכום המכפלות הרכיביות",
            "אין מה להתבלבל: x*x + y*y + z*z"
          ]
        };
      }
    }
  ],

  "complex": [
    {
      difficulty: 1,
      generator: () => {
        const a = getRandomInt(-5, 5);
        const b = getRandomInt(-5, 5);
        return {
          title: "חישוב מספר צמוד",
          description: `מצא את המספר הצמוד ל: ${a}+${b}i`,
          equation: `z = ${a}+${b}i`,
          solution: {
            steps: [
              "המספר הצמוד מתקבל על ידי החלפת הסימן של החלק המדומה",
              `z* = ${a}${b < 0 ? '+' : '-'}${Math.abs(b)}i`
            ],
            final_answers: { x: a.toString(), y: (-b).toString() }
          },
          hints: ["הצמוד משנה את הסימן של החלק המדומה", "החלק הממשי נשאר ללא שינוי"]
        };
      }
    }
  ],

  "calculus": [
    {
      difficulty: 1,
      generator: () => {
        const a = getRandomInt(1, 5);
        return {
          title: "נגזרת של פונקציה פשוטה",
          description: `מצא את הנגזרת של הפונקציה: f(x)=${a}x²`,
          equation: `f(x)=${a}x²`,
          solution: {
            steps: [
              "נשתמש בכלל הנגזרת של x בחזקה",
              "הנגזרת של x² היא 2x",
              `נכפול ב-${a}`,
              `f'(x)=${2*a}x`
            ],
            final_answers: { x: (2*a).toString() }
          },
          hints: ["זכור את כלל הנגזרת של חזקה", "הנגזרת של x² היא 2x"]
        };
      }
    }
  ],

  "sequences": [
    {
      difficulty: 1,
      generator: () => {
        const a1 = getRandomInt(1, 5);
        const d = getRandomInt(1, 3);
        return {
          title: "סדרה חשבונית",
          description: `בסדרה חשבונית האיבר הראשון הוא ${a1} וההפרש הוא ${d}. מצא את האיבר החמישי.`,
          equation: `a₁=${a1}, d=${d}`,
          solution: {
            steps: [
              "בסדרה חשבונית כל איבר שווה לקודמו ועוד ההפרש",
              `a₂ = ${a1} + ${d} = ${a1+d}`,
              `a₃ = ${a1+d} + ${d} = ${a1+2*d}`,
              `a₄ = ${a1+2*d} + ${d} = ${a1+3*d}`,
              `a₅ = ${a1+3*d} + ${d} = ${a1+4*d}`
            ],
            final_answers: { x: (a1+4*d).toString() }
          },
          hints: ["השתמש בנוסחה: aₙ = a₁ + (n-1)d", "חשב איבר אחר איבר"]
        };
      }
    }
  ],

  "geometry": [
    {
      difficulty: 1,
      generator: () => {
        const x1 = getRandomInt(-5, 5);
        const y1 = getRandomInt(-5, 5);
        const x2 = getRandomInt(-5, 5);
        const y2 = getRandomInt(-5, 5);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        return {
          title: "נקודת אמצע",
          description: `מצא את נקודת האמצע של הקטע שקצותיו בנקודות (${x1},${y1}) ו-(${x2},${y2})`,
          equation: `A(${x1},${y1}), B(${x2},${y2})`,
          solution: {
            steps: [
              "נשתמש בנוסחת נקודת אמצע",
              `x = (${x1} + ${x2})/2 = ${midX}`,
              `y = (${y1} + ${y2})/2 = ${midY}`
            ],
            final_answers: { x: midX.toString(), y: midY.toString() }
          },
          hints: ["השתמש בנוסחה: x=(x₁+x₂)/2", "השתמש בנוסחה: y=(y₁+y₂)/2"]
        };
      }
    }
  ],

  "probability": [
    {
      difficulty: 1,
      generator: () => {
        const total = getRandomInt(4, 8);
        const success = getRandomInt(1, 3);
        const probability = success / total;
        return {
          title: "הסתברות בסיסית",
          description: `בכד יש ${total} כדורים, מתוכם ${success} אדומים. מה ההסתברות להוציא כדור אדום?`,
          equation: `P(אדום) = ?`,
          solution: {
            steps: [
              "נשתמש בנוסחת ההסתברות הבסיסית",
              "מספר המקרים הרצויים חלקי מספר המקרים האפשריים",
              `P(אדום) = ${success}/${total} = ${probability.toFixed(2)}`
            ],
            final_answers: { x: probability.toFixed(2) }
          },
          hints: ["חשוב על היחס בין הכדורים האדומים לסך כל הכדורים", "השתמש בנוסחה: מספר רצוי חלקי מספר אפשרי"]
        };
      }
    }
  ]
}; 