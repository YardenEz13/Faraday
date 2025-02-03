import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, HelpCircle, BookOpen, Brain, Sparkles, Target, Award } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAssignment, submitAssignmentAnswer, getAssignmentHint, submitAssignment } from '../services/api';
import { useTranslation } from 'react-i18next';
import { Label } from "../components/ui/label";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function AssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  
  const [assignment, setAssignment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [hint, setHint] = useState(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Assignment ID from URL:', id);
    if (!id) {
      console.error('No assignment ID provided');
      toast.error(t('assignments.invalidId'));
      navigate('/assignments');
      return;
    }
    fetchAssignment();
  }, [id, navigate, t]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignment(id);
      
      console.log('Fetching assignment with ID:', id);
      console.log('Assignment response:', response);
      
      if (!response) {
        console.error('No assignment found');
        toast.error(t('assignments.notFound'));
        
        return;
      }
      
      // Set the current question from the questions array
      const currentQ = response.questions?.length ? 
        response.questions[response.currentQuestionIndex || 0] :
        // Handle old format assignments
        {
          equation: response.equation,
          solution: response.solution,
          hints: response.hints,
          description: response.description,
          studentAnswer: response.studentAnswer,
          isCorrect: response.isCompleted
        };
      
      console.log('Current question:', currentQ);
      
      setAssignment(response);
      setCurrentQuestion(currentQ);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error(t('assignments.errorFetching'));
      navigate('/assignments');
    } finally {
      setLoading(false);
    }
  };

  // Get the display title based on the current language
  const displayTitle = assignment?.title?.[i18n.language] || assignment?.title?.en || assignment?.title?.he || t('untitled');

  const fireConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      toast.error(t('pleaseEnterAnswer'));
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate answer format for probability questions
      if (currentQuestion?.equation?.includes('P(')) {
        const numValue = parseFloat(userAnswer);
        if (isNaN(numValue) || numValue < 0 || numValue > 1) {
          toast.error(t('practice.probabilityInputFormat'));
          return;
        }
      }

      const response = await submitAssignmentAnswer(id, userAnswer.trim());
      console.log('Submit response:', response);
      
      if (response.isCorrect) {
        fireConfetti();
        toast.success(t('practice.messages.correct'));
        setShowSolution(true);
        
        // Update current question with solution
        if (response.solution) {
          setCurrentQuestion(prev => ({
            ...prev,
            solution: response.solution
          }));
        }

        // Check if this was the last question
        if (!response.nextQuestion) {
          try {
            const submitResponse = await submitAssignment(id);
            console.log('Assignment submit response:', submitResponse);
            
            toast.success(t('submitted'), {
              duration: 5000
            });
            
            setTimeout(() => {
              navigate('/assignments');
            }, 3000);
            
            return;
          } catch (submitError) {
            console.error('Error submitting assignment:', submitError);
            toast.error(t('assignments.errorSubmitting'));
          }
        } else {
          // Move to next question after delay
          setTimeout(() => {
            setCurrentQuestion(response.nextQuestion);
            setShowSolution(false);
            setUserAnswer('');
            setHint(null);
          }, 2000);
        }
      } else {
        toast.error(t('practice.incorrect'));
        setUserAnswer('');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = error.response?.data?.message || t('assignments.errorSubmitting');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    try {
      setIsGettingHint(true);
      const response = await getAssignmentHint(id);
      console.log('Hint response:', response);
      
      // Handle both response formats
      const hintData = response.data?.data || response.data;
      if (!hintData || !hintData.hint) {
        throw new Error('Invalid hint data received');
      }

      setHint({
        text: hintData.hint,
        number: hintData.hintNumber || 1,
        total: hintData.totalHints || 1
      });
      toast.success(t('practice.hintReceived'));
    } catch (error) {
      console.error('Error getting hint:', error);
      toast.error(t('assignments.errorGettingHint'));
    } finally {
      setIsGettingHint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Assignment Header */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <motion.div
              variants={floatingAnimation}
              initial="initial"
              animate="animate"
              className="shrink-0"
            >
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </motion.div>
            <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
              {displayTitle}
            </h1>
          </div>

          {currentQuestion && (
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className={`text-base sm:text-lg text-foreground ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
                  {currentQuestion.description}
                </CardTitle>
                <CardDescription className={`whitespace-pre-wrap font-mono text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                  {currentQuestion.equation}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label className={`text-sm font-medium ${isRTL ? 'text-right font-yarden block' : 'text-left font-inter'}`}>
                      {t('practice.yourAnswer')}
                    </Label>
                    <Input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder={t('practice.enterAnswer')}
                      className={`bg-background ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}
                      disabled={isSubmitting || showSolution}
                    />
                  </div>

                  <div className={`flex flex-col sm:flex-row gap-3 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <Button
                      type="submit"
                      disabled={isSubmitting || showSolution}
                      className={`w-full sm:w-auto group hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isRTL ? 'font-yarden' : 'font-inter'}`}
                    >
                      <motion.div
                        variants={pulseAnimation}
                        initial="initial"
                        animate="animate"
                        className="w-4 h-4 mr-2"
                      >
                        <Target className="w-full h-full" />
                      </motion.div>
                      {t('practice.submit')}
                    </Button>

                    {!showSolution && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetHint}
                        disabled={isGettingHint || showSolution}
                        className={`w-full sm:w-auto group hover:bg-primary/10 hover:text-primary transition-all duration-200 ${isRTL ? 'font-yarden' : 'font-inter'}`}
                      >
                        <HelpCircle className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                        {t('practice.getHint')}
                      </Button>
                    )}
                  </div>
                </form>

                <AnimatePresence>
                  {hint && !showSolution && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4"
                    >
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold mb-2">{t('practice.hint', { number: hint.number })}</p>
                        <p>{hint.text}</p>
                        {hint.total > hint.number && (
                          <p className="text-sm text-gray-500 mt-2">
                            {t('practice.remainingHints', { count: hint.total - hint.number })}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {showSolution && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-4"
                    >
                      <Card className="border-primary/20 bg-background">
                        <CardHeader>
                          <CardTitle className={`text-sm font-medium ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
                            {t('practice.solution')}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`space-y-2 ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
                            {typeof currentQuestion.solution === 'object' && currentQuestion.solution.steps ? (
                              <>
                                {currentQuestion.solution.steps.map((step, index) => (
                                  <p key={index} className="text-sm text-muted-foreground">
                                    {index + 1}. {step}
                                  </p>
                                ))}
                                <p className="text-sm font-medium text-foreground mt-4">
                                  {t('practice.finalAnswer')}: {currentQuestion.solution.answer}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                {currentQuestion.solution}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default AssignmentPage; 