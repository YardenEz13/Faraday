import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { generateAssignmentWithAI, sendAssignmentToStudent, getStudents } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { toast } from "react-hot-toast";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { format, isValid } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const ASSIGNMENT_TEMPLATES = [
  {
    id: "custom",
    title: "תרגיל מותאם אישית",
    description: "צור תרגיל חדש לפי הגדרה אישית",
    prompt: ""
  },
  {
    id: "linear_equations",
    title: "מערכת משוואות לינאריות",
    description: "תרגיל במערכת משוואות עם שני נעלמים",
    prompt: "צור תרגיל במערכת משוואות לינאריות עם שני נעלמים. השתמש במספרים שלמים וקלים לחישוב."
  },
  {
    id: "word_problem",
    title: "בעיה מילולית",
    description: "תרגיל בעיה מילולית עם שני נעלמים",
    prompt: "צור בעיה מילולית שמתורגמת למערכת משוואות עם שני נעלמים. הבעיה צריכה להיות מחיי היומיום, למשל חישוב מחירים או כמויות."
  },
  {
    id: "geometry",
    title: "גיאומטריה אנליטית",
    description: "תרגיל בגיאומטריה אנליטית עם שני נעלמים",
    prompt: "צור תרגיל בגיאומטריה אנליטית שכולל מציאת נקודת חיתוך של שני ישרים במישור. השתמש במשוואות קו ישר פשוטות."
  }
];

const AI_PROMPT_TEMPLATE = `
אתה עוזר הוראה למתמטיקה. צור תרגיל מתמטיקה לפי הבקשה הבאה: "{prompt}"

כללים:
1. השתמש במספרים שלמים וסבירים
2. וודא שיש פתרון מלא ומסודר
3. הוסף רמזים שיעזרו לתלמיד להבין את דרך הפתרון
4. וודא שהתשובה הסופית מכילה שני ערכים - X ו-Y
5. חשוב: התשובות חייבות להיות מספרים שלמים בלבד
6. התשובות חייבות להיות בפורמט: x=NUMBER,y=NUMBER (ללא רווחים)

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
    "answer": "x=NUMBER,y=NUMBER"
  },
  "hints": [
    "רמז 1",
    "רמז 2",
    "רמז 3"
  ]
}

חשוב מאוד:
1. התאם את סוג התרגיל בדיוק למה שהמורה ביקש
2. וודא שהמספרים הגיוניים ומתאימים לרמת תיכון
3. כתוב את כל ההסברים בעברית
4. התשובות הסופיות חייבות להיות מספרים שלמים בלבד
5. וודא שהמשוואות מובילות לפתרון שלם ומדויק
6. התשובות חייבות להיות בפורמט המדויק: x=NUMBER,y=NUMBER
`;

function AssignmentCreatePage() {
  const navigate = useNavigate();
  const { studentId: urlStudentId } = useParams();
  const [selectedStudentId, setSelectedStudentId] = useState(urlStudentId || "");
  const [students, setStudents] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [prompt, setPrompt] = useState("");
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    // If we have a studentId in the URL, use it
    if (urlStudentId) {
      setSelectedStudentId(urlStudentId);
    }
    // Fetch students list if we don't have a studentId
    else {
      fetchStudents();
    }
  }, [urlStudentId]);

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('שגיאה בטעינת רשימת התלמידים');
    }
  };

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value);
    const template = ASSIGNMENT_TEMPLATES.find(t => t.id === value);
    if (template && template.prompt) {
      setPrompt(template.prompt);
    } else {
      setPrompt("");
    }
  };

  const handleGenerateAssignment = async () => {
    if (!prompt) {
      toast.error("Please provide some instructions for the assignment.");
      return;
    }
    setIsSubmitting(true);

    try {
      const fullPrompt = AI_PROMPT_TEMPLATE.replace('{prompt}', prompt);
      const response = await generateAssignmentWithAI(fullPrompt);
      let parsedResponse = response.data;
      
      if (typeof response.data === 'string') {
        parsedResponse = JSON.parse(response.data);
      }

      // Validate the response structure
      if (!parsedResponse?.solution) {
        console.error('Missing solution:', parsedResponse);
        toast.error('Generated assignment is missing solution. Please try again.');
        setIsSubmitting(false);
        return;
      }

      let x, y;

      // Handle old format (final_answers)
      if (parsedResponse.solution.final_answers) {
        x = parsedResponse.solution.final_answers.x;
        y = parsedResponse.solution.final_answers.y;
      }
      // Handle new format (answer)
      else if (parsedResponse.solution.answer) {
        const answerMatch = parsedResponse.solution.answer.match(/x=(-?\d+),y=(-?\d+)/);
        if (!answerMatch) {
          console.error('Invalid answer format:', parsedResponse.solution.answer);
          toast.error('Generated answer is in incorrect format. Please try again.');
          setIsSubmitting(false);
          return;
        }
        x = answerMatch[1];
        y = answerMatch[2];
      }
      // No valid format found
      else {
        console.error('No valid answer format found:', parsedResponse.solution);
        toast.error('Generated assignment has invalid solution format. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Convert to numbers and validate
      x = parseInt(x);
      y = parseInt(y);

      if (!Number.isInteger(x) || !Number.isInteger(y)) {
        console.error('Non-integer solutions:', { x, y });
        toast.error('Generated assignment must have integer solutions. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Store the solution in the exact format needed for verification
      const formattedAnswer = `x=${x},y=${y}`;
      parsedResponse.solution = {
        steps: parsedResponse.solution.steps || [],
        answer: formattedAnswer,
        final_answers: {
          x: x.toString(),
          y: y.toString()
        }
      };

      console.log('Generated assignment:', {
        title: parsedResponse.title,
        description: parsedResponse.description,
        equation: parsedResponse.equation,
        solution: parsedResponse.solution
      });

      setGeneratedAssignment(parsedResponse);
      toast.success("Assignment generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAssignment = async () => {
    console.log('Starting assignment send process...');
    
    if (!selectedStudentId || !generatedAssignment || !dueDate) {
      const missing = [];
      if (!selectedStudentId) missing.push('student');
      if (!generatedAssignment) missing.push('generatedAssignment');
      if (!dueDate) missing.push('dueDate');
      
      console.error('Missing required fields:', missing);
      toast.error("אנא מלא את כל השדות הנדרשים");
      return;
    }

    // Validate solution exists and has the correct format
    if (!generatedAssignment.solution?.final_answers?.x || 
        !generatedAssignment.solution?.final_answers?.y) {
      console.error('Missing solution fields:', generatedAssignment.solution);
      toast.error("התרגיל חסר פתרון מלא");
      return;
    }

    setIsSubmitting(true);

    try {
      const dueDateWithTime = new Date(dueDate);
      if (!isValid(dueDateWithTime)) {
        console.error('Invalid date:', dueDateWithTime);
        toast.error("תאריך לא תקין");
        return;
      }

      dueDateWithTime.setHours(23, 59, 59);
      const formattedDueDate = format(dueDateWithTime, 'yyyy-MM-dd HH:mm:ss');

      // Parse the solution if it's a string
      let parsedSolution = generatedAssignment.solution;
      if (typeof parsedSolution === 'string') {
        try {
          parsedSolution = JSON.parse(parsedSolution);
        } catch (e) {
          console.error('Failed to parse solution:', e);
        }
      }

      // Format the answer in the exact format needed for verification
      const x = parsedSolution.final_answers?.x || generatedAssignment.solution.final_answers?.x;
      const y = parsedSolution.final_answers?.y || generatedAssignment.solution.final_answers?.y;
      const formattedAnswer = `x=${x},y=${y}`;

      // Create the solution object with both the formatted answer and the detailed solution
      const solution = JSON.stringify({
        steps: parsedSolution.steps || [],
        answer: formattedAnswer,
        final_answers: {
          x: x.toString(),
          y: y.toString()
        }
      });

      console.log('Formatted solution:', {
        original: generatedAssignment.solution,
        parsed: parsedSolution,
        formatted: JSON.parse(solution)
      });

      const formattedAssignment = {
        studentId: selectedStudentId,
        title: generatedAssignment.title?.trim() || '',
        description: generatedAssignment.description?.trim() || '',
        equation: generatedAssignment.equation?.trim() || '',
        solution,
        hints: Array.isArray(generatedAssignment.hints) ? generatedAssignment.hints : [],
        dueDate: formattedDueDate
      };

      console.log('Sending formatted assignment:', {
        ...formattedAssignment,
        solution: JSON.parse(formattedAssignment.solution)
      });

      console.log('Stored solution:', {
        rawSolution: generatedAssignment.solution,
        parsedSolution: typeof generatedAssignment.solution === 'string' 
          ? JSON.parse(generatedAssignment.solution) 
          : generatedAssignment.solution,
        formattedAnswer: formattedAnswer
      });

      const response = await sendAssignmentToStudent(selectedStudentId, formattedAssignment);
      console.log('Server response:', response.data);

      toast.success("המטלה נשלחה בהצלחה!");
      navigate("/dashboard/teacher");
    } catch (error) {
      console.error('Error sending assignment:', {
        error,
        response: error.response,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "שגיאה בשליחת המטלה. אנא נסה שוב.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        חזרה
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>יצירת שיעורי בית חדשים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!urlStudentId && (
              <div className="space-y-2">
                <Label>בחר תלמיד</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר תלמיד" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.username} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4">בחר סוג תרגיל:</h3>
              <RadioGroup
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {ASSIGNMENT_TEMPLATES.map((template) => (
                  <div key={template.id} className="flex items-start space-x-2">
                    <RadioGroupItem value={template.id} id={template.id} />
                    <Label htmlFor={template.id} className="flex flex-col">
                      <span className="font-semibold">{template.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {template.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">
                {selectedTemplate === "custom" ? "תאר את התרגיל שברצונך ליצור:" : "ערוך את ההנחיות לפי הצורך:"}
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="לדוגמה: צור תרגיל במערכת משוואות לינאריות..."
                className="min-h-[100px]"
              />

              <Button 
                onClick={handleGenerateAssignment}
                disabled={isSubmitting || !prompt}
                className="w-full"
              >
                {isSubmitting ? "מייצר תרגיל..." : "צור תרגיל"}
              </Button>
            </div>

            {generatedAssignment && typeof generatedAssignment === "object" && (
              <div className="mt-8 space-y-4 bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  {generatedAssignment.title || "תרגיל חדש"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">תיאור:</h4>
                    <p>{generatedAssignment.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">משוואות:</h4>
                    <pre className="bg-background p-4 rounded-md">
                      {generatedAssignment.equation}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold">רמזים:</h4>
                    <ul className="list-disc list-inside">
                      {generatedAssignment.hints.map((hint, index) => (
                        <li key={index}>{hint}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dueDate">תאריך הגשה:</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendAssignment}
                    disabled={isSubmitting || !dueDate}
                    className="w-full"
                  >
                    {isSubmitting ? "שולח..." : "שלח לתלמיד"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssignmentCreatePage; 