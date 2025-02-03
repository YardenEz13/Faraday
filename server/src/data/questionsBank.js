// Utility functions for generating questions
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateNiceCoefficients = (difficulty) => {
  let baseRange = difficulty * 3;
  // Ensure variety with occasional simple fractions
  if (Math.random() < 0.3 && difficulty > 2) {
    return {
      a: getRandomInt(-baseRange, baseRange)/2,
      b: getRandomInt(-baseRange, baseRange)/2
    };
  }
  return {
    a: getRandomInt(-baseRange, baseRange),
    b: getRandomInt(-baseRange, baseRange)
  };
};

// מאגר השאלות המעודכן
export const QUESTIONS_BANK = {
  "equations": [
    {
      difficulty: 1,
      generator: () => {
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
    },
    {
      difficulty: 3,
      generator: () => {
        const x = getRandomInt(1, 3), y = getRandomInt(1, 3);
        const eq1 = `2x + 3y = ${2*x + 3*y}`;
        const eq2 = `4x - y = ${4*x - y}`;
        return {
          title: "מערכת משוואות מורכבת",
          description: "פתור את המערכת:",
          equation: `${eq1}\n${eq2}`,
          solution: {
            steps: [
              "נכפול את המשוואה השנייה ב-3: 12x - 3y = " + (4*x - y)*3,
              "נחבר עם המשוואה הראשונה: 14x = " + (2*x + 3*y + (4*x - y)*3),
              `x = ${x}`,
              `נציב במשוואה השנייה: 4*${x} - y = ${4*x - y} → y = ${y}`
            ],
            final_answers: { x: x.toString(), y: y.toString() }
          },
          hints: ["נסה להכפיל את אחת המשוואות כדי לבטל משתנה", "המקדם של y במשוואה הראשונה הוא 3"]
        };
      }
    }
  ],

  "trigonometry": [
    {
      difficulty: 1,
      generator: () => {
        const angle = getRandomInt(1, 4) * 30;
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
              "sin(2x) = √2/2 ⇒ 2x = 45°, 135°",
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
    },
    {
      difficulty: 3,
      generator: () => {
        const angle = getRandomInt(2, 6) * 15;
        return {
          title: "זהויות טריגונומטריות",
          description: `השתמש בזהויות כדי לפשט: sin²(${angle}°) + cos²(${angle}°)`,
          equation: "sin²θ + cos²θ = ?",
          solution: {
            steps: [
              "זוהי הזהות הטריגונומטרית הבסיסית",
              "sin²θ + cos²θ = 1 לכל זווית θ"
            ],
            final_answers: { x: "1" }
          },
          hints: ["זכור את הזהות הפיתגוראית", "אין צורך בחישוב מספרי"]
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
    },
    {
      difficulty: 3,
      generator: () => {
        const x = getRandomInt(-3, 3);
        const y = getRandomInt(-3, 3);
        const magnitude = Math.sqrt(x*x + y*y).toFixed(2);
        return {
          title: "גודל וקטור",
          description: "חשב את הגודל של הוקטור:",
          equation: `v = (${x}, ${y})`,
          solution: {
            steps: [
              "||v|| = √(x² + y²)",
              `= √(${x}² + ${y}²) = √${x*x + y*y} ≈ ${magnitude}`
            ],
            final_answers: { x: magnitude }
          },
          hints: ["השתמש במשפט פיתגורס", "סכום הריבועים של הרכיבים"]
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
    },
    {
      difficulty: 2,
      generator: () => {
        const a = getRandomInt(-3, 3);
        const b = getRandomInt(-3, 3);
        const c = getRandomInt(-3, 3);
        const d = getRandomInt(-3, 3);
        return {
          title: "כפל מספרים מרוכבים",
          description: "חשב את המכפלה:",
          equation: `(${a}+${b}i)(${c}+${d}i)`,
          solution: {
            steps: [
              "נפתח לפי חוק הפילוג:",
              `= ${a}*${c} + ${a}*${d}i + ${b}i*${c} + ${b}i*${d}i`,
              `= ${a*c} + (${a*d + b*c})i + ${b*d}i²`,
              `= ${a*c - b*d} + ${a*d + b*c}i (מאחר ש-i² = -1)`
            ],
            final_answers: { real: (a*c - b*d).toString(), imag: (a*d + b*c).toString() }
          },
          hints: ["פתח לפי כלל הפילוג", "זכור ש-i² = -1"]
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
    },
    {
      difficulty: 2,
      generator: () => {
        const a = getRandomInt(1, 3);
        const b = getRandomInt(1, 3);
        return {
          title: "נגזרת של פונקציה רציונלית",
          description: `מצא את הנגזרת של: f(x) = (${a}x + ${b})/x`,
          equation: "f(x) = ?",
          solution: {
            steps: [
              "נפשט את הפונקציה:",
              `f(x) = ${a} + ${b}/x`,
              "נגזור כל איבר בנפרד:",
              "f'(x) = 0 + (-${b})/x²",
              `f'(x) = -${b}/x²`
            ],
            final_answers: { derivative: `-${b}/x²` }
          },
          hints: ["פשט את הביטוי לפני גזירה", "הנגזרת של 1/x היא -1/x²"]
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
    },
    {
      difficulty: 2,
      generator: () => {
        const a1 = getRandomInt(2, 5);
        const r = getRandomInt(2, 3);
        return {
          title: "סדרה הנדסית",
          description: `בסדרה הנדסית האיבר הראשון הוא ${a1} והיחס הוא ${r}. מצא את האיבר הרביעי.`,
          equation: `a₁=${a1}, r=${r}`,
          solution: {
            steps: [
              "נוסחת איבר כללי: aₙ = a₁·r^(n-1)",
              `a₄ = ${a1}·${r}^(4-1)`,
              `= ${a1}·${r}^3 = ${a1*r**3}`
            ],
            final_answers: { x: (a1*r**3).toString() }
          },
          hints: ["השתמש בנוסחה aₙ = a₁·r^(n-1)", "חשב חזקה שלישית"]
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
    },
    {
      difficulty: 2,
      generator: () => {
        const side = getRandomInt(3, 7);
        return {
          title: "היקף ואורך אלכסון במרובע",
          description: `חשב את היקף הריבוע ואורך האלכסון כאשר אורך הצלע הוא ${side}`,
          equation: "ריבוע עם צלע a = " + side,
          solution: {
            steps: [
              "היקף: 4a",
              `= 4*${side} = ${4*side}`,
              "אלכסון: a√2",
              `= ${side}√2 ≈ ${(side*1.414).toFixed(2)}`
            ],
            final_answers: { perimeter: (4*side).toString(), diagonal: `${side}√2` }
          },
          hints: ["היקף ריבוע הוא 4*צלע", "אלכסון ריבוע הוא a√2"]
        };
      }
    }
  ],

  "probability": [
    {
      difficulty: 1,
      generator: () => {
        const total = getRandomInt(5, 12);
        const success = getRandomInt(1, 5);
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
    },
    {
      difficulty: 2,
      generator: () => {
        const red = getRandomInt(2, 8);
        const blue = getRandomInt(2, 8);
        return {
          title: "הסתברות מורכבת",
          description: `בכד ${red} כדורים אדומים ו-${blue} כחולים. מה ההסתברות להוציא אדום ואז כחול ללא החזרה?`,
          equation: "P(אדום, אז כחול) = ?",
          solution: {
            steps: [
              `הסתברות ראשונה: ${red}/${red+blue}`,
              `הסתברות שנייה: ${blue}/${red+blue-1}`,
              `סה"כ: (${red}/${red+blue}) * (${blue}/${red+blue-1}) = ${(red*blue/((red+blue)*(red+blue-1))).toFixed(2)}`
            ],
            final_answers: { probability: (red*blue/((red+blue)*(red+blue-1))).toFixed(2) }
          },
          hints: ["הסתברות מותנית", "המכנה קטן ב-1 במשיכה השנייה"]
        };
      }
    }
  ]
}; 