import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "react-hot-toast";
import { generateAssignmentWithAI } from "../services/api";
import { Brain, ArrowLeft, Plus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

function PracticePage() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const practiceTopics = [
    {
      title: "מערכת משוואות",
      description: "תרגול מערכת משוואות עם שני נעלמים",
      prompt: "צור תרגיל במערכת משוואות לינאריות עם שני נעלמים. השתמש במספרים שלמים וקלים לחישוב."
    },
    {
      title: "בעיות מילוליות",
      description: "תרגול בעיות מילוליות עם משוואות",
      prompt: "צור בעיה מילולית שמתורגמת למערכת משוואות עם שני נעלמים. הבעיה צריכה להיות מחיי היומיום, למשל חישוב מחירים או כמויות."
    },
    {
      title: "גיאומטריה אנליטית",
      description: "תרגול חישובים בגיאומטריה אנליטית",
      prompt: "צור תרגיל בגיאומטריה אנליטית שכולל מציאת נקודת חיתוך של שני ישרים במישור. השתמש במשוואות קו ישר פשוטות."
    }
  ];

  const handleTopicSelect = (topicPrompt) => {
    setPrompt(topicPrompt);
    handleGenerateAssignment(topicPrompt);
  };

  const handleGenerateAssignment = async (selectedPrompt = prompt) => {
    if (!selectedPrompt) {
      toast.error("אנא בחר נושא או תאר את התרגיל שברצונך לתרגל");
      return;
    }
    setIsSubmitting(true);

    const fullPrompt = `
[INST]
אתה עוזר הוראה למתמטיקה. צור תרגיל מתמטיקה לפי הבקשה הבאה: "${selectedPrompt}"

כללים:
1. השתמש במספרים שלמים וסבירים
2. וודא שיש פתרון מלא ומסודר
3. הוסף רמזים שיעזרו לתלמיד להבין את דרך הפתרון
4. וודא שהתשובה הסופית מכילה שני ערכים - X ו-Y

החזר את התרגיל במבנה הבא:
{
  "title": "כותרת התרגיל",
  "description": "תיאור התרגיל",
  "equation": "מערכת המשוואות",
  "solution": {
    "steps": [
      "שלב 1: הסבר ברור של הצעד הראשון",
      "שלב 2: הסבר ברור של הצעד השני",
      "..."
    ],
    "final_answers": {
      "x": "הערך של X",
      "y": "הערך של Y"
    }
  },
  "hints": [
    "רמז 1",
    "רמז 2",
    "רמז 3"
  ]
}

חשוב:
1. התאם את סוג התרגיל בדיוק למה שהתלמיד ביקש
2. וודא שהמספרים הגיוניים ומתאימים לרמת תיכון
3. כתוב את כל ההסברים בעברית
4. וודא שהתשובות הסופיות הן מספרים בודדים
[/INST]
`;

    try {
      const response = await generateAssignmentWithAI(fullPrompt);
      let parsedResponse = response.data;
      
      if (typeof response.data === 'string') {
        try {
          parsedResponse = JSON.parse(response.data);
        } catch (e) {
          console.error('Failed to parse AI response:', e);
          toast.error('Failed to parse the generated assignment. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      if (!parsedResponse.title || !parsedResponse.description || 
          !parsedResponse.solution?.final_answers?.x || !parsedResponse.solution?.final_answers?.y) {
        console.error('Invalid response structure:', parsedResponse);
        toast.error('The generated assignment is missing required fields. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setGeneratedAssignment(parsedResponse);
      toast.success("התרגיל נוצר בהצלחה!");
    } catch (error) {
      console.error(error);
      toast.error("שגיאה ביצירת התרגיל. אנא נסה שוב.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        חזרה
      </Button>

      <div className="grid gap-6">
        {/* Topics Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <CardTitle>נושאים לתרגול</CardTitle>
            </div>
            <CardDescription>בחר נושא לתרגול או צור תרגיל מותאם אישית</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {practiceTopics.map((topic, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTopicSelect(topic.prompt)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <CardTitle className="text-lg">תרגיל מותאם אישית</CardTitle>
                  </div>
                  <CardDescription>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="תאר את סוג התרגיל שברצונך לתרגל..."
                      className="mt-2 min-h-[80px]"
                    />
                    <Button 
                      onClick={() => handleGenerateAssignment()}
                      disabled={isSubmitting || !prompt}
                      className="w-full mt-2"
                    >
                      {isSubmitting ? "מייצר תרגיל..." : "צור תרגיל"}
                    </Button>
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Generated Assignment Section */}
        {generatedAssignment && typeof generatedAssignment === "object" && (
          <Card>
            <CardHeader>
              <CardTitle>{generatedAssignment.title || "תרגיל חדש"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">תיאור:</h4>
                <p>{generatedAssignment.description}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">משוואות:</h4>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  {generatedAssignment.equation}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">רמזים:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {generatedAssignment.hints.map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">פתרון מלא:</h4>
                <div className="space-y-2 bg-muted p-4 rounded-md">
                  {generatedAssignment.solution.steps.map((step, index) => (
                    <p key={index} className="text-sm">{step}</p>
                  ))}
                  <p className="font-medium mt-4 text-primary">
                    תשובה סופית: x = {generatedAssignment.solution.final_answers.x}, 
                    y = {generatedAssignment.solution.final_answers.y}
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => handleGenerateAssignment(prompt)}
                className="w-full mt-4"
              >
                צור תרגיל נוסף
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PracticePage;
