const fetch = require('node-fetch');

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-2-70b-chat-hf";

// קונפיגורציה של הפרומפט לפי נושאים
const TOPICS_CONFIG = {
  "equations": {
    title: "מערכת משוואות",
    basePrompt: "צור תרגיל במערכת משוואות"
  },
  "trigonometry": {
    title: "טריגונומטריה",
    basePrompt: "צור תרגיל בטריגונומטריה"
  },
  "vectors": {
    title: "וקטורים",
    basePrompt: "צור תרגיל בוקטורים"
  },
  "complex": {
    title: "מספרים מרוכבים",
    basePrompt: "צור תרגיל במספרים מרוכבים"
  },
  "calculus": {
    title: "חשבון דיפרנציאלי ואינטגרלי",
    basePrompt: "צור תרגיל בחדו\"א"
  },
  "sequences": {
    title: "סדרות",
    basePrompt: "צור תרגיל בסדרות"
  },
  "geometry": {
    title: "גיאומטריה אנליטית",
    basePrompt: "צור תרגיל בגיאומטריה אנליטית"
  },
  "probability": {
    title: "הסתברות וסטטיסטיקה",
    basePrompt: "צור תרגיל בהסתברות"
  }
};

const generateMathQuestion = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic || !TOPICS_CONFIG[topic]) {
      return res.status(400).json({ error: "נושא לא תקין" });
    }

    if (!difficulty || difficulty < 1 || difficulty > 5) {
      return res.status(400).json({ error: "רמת קושי לא תקינה" });
    }

    const topicConfig = TOPICS_CONFIG[topic];
    const prompt = buildPrompt(topicConfig, difficulty);

    const response = await fetch(HUGGING_FACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    // ניסיון לפרסר את התשובה כ-JSON
    try {
      const parsedQuestion = JSON.parse(result[0].generated_text);
      return res.json(parsedQuestion);
    } catch (parseError) {
      // אם הפרסור נכשל, מחזירים את התשובה כטקסט רגיל
      return res.json({
        title: topicConfig.title,
        description: result[0].generated_text,
        equation: "",
        solution: {
          steps: [],
          final_answers: {}
        },
        hints: []
      });
    }

  } catch (error) {
    console.error('Error generating math question:', error);
    res.status(500).json({ 
      error: "שגיאה ביצירת השאלה", 
      details: error.message 
    });
  }
};

const buildPrompt = (topicConfig, difficulty) => {
  const difficultyText = getDifficultyText(difficulty);
  
  return `
[INST]
אתה עוזר הוראה למתמטיקה. ${topicConfig.basePrompt} ברמה ${difficultyText}.

כללים:
1. השתמש במספרים מתאימים לרמת הקושי
2. וודא שיש פתרון מלא ומסודר
3. הוסף רמזים שיעזרו לתלמיד להבין את דרך הפתרון
4. התאם את התשובה הסופית לסוג התרגיל

החזר את התרגיל במבנה הבא:
{
  "title": "כותרת התרגיל",
  "description": "תיאור התרגיל",
  "equation": "המשוואות או הבעיה",
  "solution": {
    "steps": ["צעד 1", "צעד 2", "..."],
    "final_answers": {
      "x": "ערך ראשון",
      "y": "ערך שני"
    }
  },
  "hints": ["רמז 1", "רמז 2", "רמז 3"]
}
[/INST]
`;
};

const getDifficultyText = (difficulty) => {
  switch (difficulty) {
    case 1:
      return "קלה מאוד";
    case 2:
      return "קלה";
    case 3:
      return "בינונית";
    case 4:
      return "קשה";
    case 5:
      return "קשה מאוד";
    default:
      return "בינונית";
  }
};

module.exports = {
  generateMathQuestion
}; 