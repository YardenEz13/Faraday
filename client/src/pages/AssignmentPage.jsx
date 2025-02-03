import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssignment, submitAssignmentAnswer, deleteAssignment } from "../services/api";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { format, isValid, parseISO } from "date-fns";
import { toast } from "react-hot-toast";
import { useAuth } from "../providers/auth";

/**
 * AssignmentPage
 * מציג תרגיל ספציפי לתלמיד ומאפשר לו להגיש פתרון
 */
function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({ x: "", y: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAssignment();
    }
  }, [id]);

  const fetchAssignment = async () => {
    try {
      if (!id) {
        navigate('/dashboard/student');
        return;
      }

      console.log('Fetching assignment with ID:', id);
      const response = await getAssignment(id);
      console.log('Assignment data:', response.data);
      
      // Ensure equation is properly formatted
      const assignmentData = {
        ...response.data,
        equation: response.data.equation || "לא נמצאו משוואות"
      };
      
      setAssignment(assignmentData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignment:', error.response?.data || error);
      setError(error.response?.data?.message || error.message);
      setLoading(false);
      
      // If assignment not found, redirect back to dashboard
      if (error.response?.status === 404) {
        toast.error('התרגיל לא נמצא');
        navigate('/dashboard/student');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Starting submission process...');
    console.log('Original equations:', assignment.equation);
    
    if (!answers.x || !answers.y) {
      toast.error("אנא מלא את שני הערכים");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse numbers
      const x = parseFloat(answers.x);
      const y = parseFloat(answers.y);
      
      // Get coefficients from the equations
      const equations = assignment.equation.split('\n');
      console.log('Split equations:', equations);
      
      const [eq1, eq2] = equations.map(eq => {
        // Parse equation like "ax + by = c"
        const parts = eq.split('=').map(part => part.trim());
        const rightSide = parseFloat(parts[1]);
        const leftSide = parts[0].split('+').map(term => term.trim());
        
        const xTerm = leftSide.find(term => term.includes('x')) || '0x';
        const yTerm = leftSide.find(term => term.includes('y')) || '0y';
        
        const a = parseFloat(xTerm.replace('x', '')) || 0;
        const b = parseFloat(yTerm.replace('y', '')) || 0;
        
        console.log('Parsed equation:', {
          original: eq,
          coefficients: { a, b, c: rightSide },
          terms: { xTerm, yTerm }
        });
        
        return { a, b, c: rightSide };
      });

      // Calculate exact solution using Cramer's rule
      const det = (eq1.a * eq2.b) - (eq1.b * eq2.a);
      const detX = (eq1.c * eq2.b) - (eq1.b * eq2.c);
      const detY = (eq1.a * eq2.c) - (eq2.a * eq1.c);
      
      const exactX = detX / det;
      const exactY = detY / det;

      console.log('=== Equation Analysis ===');
      console.log('Equation 1:', `${eq1.a}x + ${eq1.b}y = ${eq1.c}`);
      console.log('Equation 2:', `${eq2.a}x + ${eq2.b}y = ${eq2.c}`);
      console.log('Determinants:', { det, detX, detY });
      console.log('Exact solution:', { x: exactX, y: exactY });
      
      // Verify solution by substituting back
      const eq1Result = eq1.a * x + eq1.b * y;
      const eq2Result = eq2.a * x + eq2.b * y;
      
      console.log('Solution verification:', {
        equation1: {
          left: eq1Result,
          right: eq1.c,
          difference: Math.abs(eq1Result - eq1.c)
        },
        equation2: {
          left: eq2Result,
          right: eq2.c,
          difference: Math.abs(eq2Result - eq2.c)
        }
      });
      
      // Try different formats for the answer
      const formats = [
        `x=${x}, y=${y}`,
        `x=${x.toFixed(1)}, y=${y.toFixed(1)}`,
        `x=${x.toFixed(2)}, y=${y.toFixed(2)}`,
        `x=${Math.round(x)}, y=${Math.round(y)}`,
        // Try without spaces
        `x=${x},y=${y}`,
        `x=${x.toFixed(1)},y=${y.toFixed(1)}`,
        `x=${x.toFixed(2)},y=${y.toFixed(2)}`,
        `x=${Math.round(x)},y=${Math.round(y)}`
      ];
      
      console.log('Trying different formats:', formats);
      
      // Try each format
      for (const format of formats) {
        console.log(`Trying format: ${format}`);
        try {
          const response = await submitAssignmentAnswer(id, format);
          console.log(`Response for format ${format}:`, response.data);
          if (response.data.isCorrect) {
            toast.success("כל הכבוד! התשובה נכונה!");
            navigate('/dashboard/student');
            return;
          }
        } catch (error) {
          console.error(`Error with format ${format}:`, error);
        }
      }
      
      // If we got here, none of the formats worked
      toast.error(`התשובה לא נכונה. נסה שוב.
        התשובה שלך: x=${x}, y=${y}
        התשובה המחושבת: x=${exactX}, y=${exactY}`);
      setAnswers({ x: "", y: "" });
      
    } catch (error) {
      console.error('Submission error:', {
        error: error,
        response: error.response,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || "שגיאה בשליחת התשובה");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את המטלה?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteAssignment(id);
      toast.success('המטלה נמחקה בהצלחה');
      navigate('/dashboard/teacher');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error(error.response?.data?.error || 'שגיאה במחיקת המטלה');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">טוען...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">שגיאה: {error}</div>;
  if (!assignment) return <div className="flex items-center justify-center min-h-screen">לא נמצא תרגיל</div>;

  // Format equations for display
  const equations = assignment.equation
    ? assignment.equation
        .split('\n')
        .filter(eq => eq.trim()) // Remove empty lines
        .map((eq, i) => (
          <div key={i} className="text-2xl font-mono my-4 text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow" dir="ltr">
            {eq.includes('=') ? eq : `${eq} = 0`}
          </div>
        ))
    : [];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline"
          onClick={() => navigate(-1)}
        >
          חזור
        </Button>
        
        {user.role === 'teacher' && (
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'מוחק...' : 'מחק מטלה'}
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{assignment.title}</CardTitle>
          <div className="text-sm text-muted-foreground">
            תאריך הגשה: {assignment.dueDate ? (
              isValid(parseISO(assignment.dueDate)) 
                ? format(parseISO(assignment.dueDate), 'dd/MM/yyyy')
                : 'תאריך לא תקין'
              ) : 'תאריך לא נקבע'}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">תיאור התרגיל:</h3>
              <p className="text-lg">{assignment.description}</p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">מערכת המשוואות:</h3>
              <div className="bg-muted p-6 rounded-lg shadow-inner">
                {equations.length > 0 ? equations : (
                  <div className="text-center text-muted-foreground">לא נמצאו משוואות</div>
                )}
              </div>
            </div>

            {assignment.hints && assignment.hints.length > 0 && (
              <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">רמזים:</h3>
                <ul className="list-disc list-inside space-y-3">
                  {assignment.hints.map((hint, index) => (
                    <li key={index} className="text-lg text-yellow-800 dark:text-yellow-200">{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-muted p-4 rounded-lg">
                  <label className="block text-lg font-medium mb-2 text-center">
                    X = 
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={answers.x}
                    onChange={(e) => setAnswers(prev => ({ ...prev, x: e.target.value }))}
                    placeholder="הזן ערך ל-X"
                    className="w-full text-center text-xl"
                    dir="ltr"
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <label className="block text-lg font-medium mb-2 text-center">
                    Y = 
                  </label>
                  <Input
                    type="number"
                    step="any"
                    value={answers.y}
                    onChange={(e) => setAnswers(prev => ({ ...prev, y: e.target.value }))}
                    placeholder="הזן ערך ל-Y"
                    className="w-full text-center text-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <Button 
                type="submit"
                disabled={isSubmitting || !answers.x || !answers.y}
                className="w-full text-lg py-6"
              >
                {isSubmitting ? "בודק..." : "שלח תשובה"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AssignmentPage; 