// client/src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { BookOpen, ClockIcon, CheckCircle, Brain, GraduationCap, Trophy, Zap, Sparkles, Star, Target, Award } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { isValid } from 'date-fns';
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

const glowAnimation = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getStudentDashboard();
      console.log('Dashboard data:', response);
      
      // Set student data from the response
      if (response && response.student) {
        console.log('Setting student data with math level:', response.student.mathLevel);
        setStudentData(response.student);
      } else {
        console.log('No valid student data found');
        setStudentData(null);
      }
      
      // Combine all assignments
      const allAssignments = [
        ...(response.activeAssignments || []),
        ...(response.lateAssignments || []),
        ...(response.submittedAssignments || [])
      ];
      
      setAssignments(allAssignments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error(t('dashboardError'));
      setAssignments([]);
      setStudentData(null);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    try {
      if (!dateString) return t('dateNotAvailable');
      
      const date = new Date(dateString);
      
      if (!isValid(date) || date.getFullYear() < 2000 || date.getFullYear() > 2100) {
        return t('comingSoon');
      }
      
      return new Date(dateString).toLocaleDateString(i18n.language === 'he' ? 'he-IL' : 'en-US');
    } catch (error) {
      console.error('Error formatting date:', error);
      return t('comingSoon');
    }
  };

  // Calculate statistics
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'submitted').length;
  const completionRate = totalAssignments > 0 
    ? Math.round((completedAssignments / totalAssignments) * 100)
    : 0;

  // Separate assignments into categories
  const activeAssignments = assignments.filter(a => 
    !a.status || a.status === 'active'
  );
  
  const lateAssignments = assignments.filter(a => 
    a.isLate && (!a.status || a.status === 'active')
  );
  
  const completedAssignmentsList = assignments.filter(a => 
    a.status === 'submitted'
  );

  const EmptyState = () => (
    <Card className="text-center p-4 sm:p-6 border-primary/20 bg-background">
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h2 className={`text-lg sm:text-xl font-semibold text-foreground ${isRTL ? 'font-yarden' : 'font-inter'}`}>
          {t('noAssignments')}
        </h2>
        <p className={`text-sm sm:text-base text-muted-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
          {t('noAssignmentsDesc')}
        </p>
      </div>
    </Card>
  );

  const AssignmentCard = ({ assignment }) => {
    const displayTitle = typeof assignment.title === 'object' ? 
      (assignment.title[i18n.language] || assignment.title.en || assignment.title.he) : 
      (assignment.title || t('untitled'));

    return (
      <Card className="border-primary/20 bg-background h-full flex flex-col">
        <CardHeader className="flex-none p-4 sm:p-6">
          <CardTitle className={`text-base sm:text-lg text-foreground ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
            {displayTitle}
          </CardTitle>
          <div className={`text-sm text-muted-foreground ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
            {t('due')}: {formatDate(assignment.dueDate)}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between p-4 sm:p-6 pt-0">
          <p className={`mb-4 text-sm text-muted-foreground line-clamp-2 ${isRTL ? 'text-right font-yarden' : 'text-left font-inter'}`}>
            {assignment.description}
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <Button 
              asChild
              variant="outline"
              className={`w-full sm:w-auto order-2 sm:order-1 hover:bg-primary/10 hover:text-primary transition-colors border-primary/20 text-foreground text-sm ${isRTL ? 'font-yarden' : 'font-inter'}`}
            >
              <Link to={`/assignment/${assignment._id}`}>
                {(assignment.status === 'submitted' || assignment.status === 'graded') ? t('viewAssignment') : t('startAssignment')}
              </Link>
            </Button>
            <div className={`flex items-center justify-end gap-2 order-1 sm:order-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {t('completed')} ✓
                </span>
              )}
              {assignment.isLate && (
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {t('late')}!
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background via-background to-primary/5"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header with Student Info */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-6 sm:mb-8"
        >
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <motion.div 
              variants={item}
              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <motion.div
                variants={floatingAnimation}
                initial="initial"
                animate="animate"
              >
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
              </motion.div>
              <h1 className={`text-lg sm:text-3xl font-bold bg-gradient-to-r from-primary via-primary/50 to-primary bg-clip-text text-transparent ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                {t('myAssignments')}
              </h1>
            </motion.div>
            <motion.div variants={item}>
              <Button 
                asChild
                variant="outline"
                className={`w-full sm:w-auto group hover:bg-primary hover:text-primary-foreground transition-all duration-300 border-primary/20 text-foreground text-sm ${isRTL ? 'font-yarden' : 'font-inter'}`}
              >
                <Link to="/practice" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <motion.div
                    variants={pulseAnimation}
                    initial="initial"
                    animate="animate"
                    className="w-4 h-4 shrink-0"
                  >
                    <Brain className="w-full h-full" />
                  </motion.div>
                  {t('nav.practice')} 
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Student Stats */}
          <motion.div 
            variants={container}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div variants={item}>
              <Link to="/levels" className="block">
                <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group">
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <motion.div 
                      variants={glowAnimation}
                      initial="initial"
                      animate="animate"
                      className="p-2 bg-primary/10 rounded-lg shrink-0 group-hover:bg-primary/20 transition-colors duration-300"
                    >
                      <Target className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                      <p className="text-sm text-muted-foreground">{t('mathLevel')}</p>
                      <motion.p 
                        className="text-xl sm:text-2xl font-semibold text-foreground"
                        variants={pulseAnimation}
                        initial="initial"
                        animate="animate"
                      >
                        {studentData?.mathLevel ? Number(studentData.mathLevel).toFixed(1) : '1.0'}
                      </motion.p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <motion.div 
                    variants={glowAnimation}
                    initial="initial"
                    animate="animate"
                    className="p-2 bg-primary/10 rounded-lg shrink-0"
                  >
                    <Trophy className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                    <p className="text-sm text-muted-foreground">{t('completionRate')}</p>
                    <motion.div 
                      variants={pulseAnimation}
                      initial="initial"
                      animate="animate"
                      className="flex items-center gap-2"
                    >
                      <p className="text-xl sm:text-2xl font-semibold text-foreground">{completionRate}%</p>
                      {completionRate >= 80 && <Star className="w-4 h-4 text-yellow-500" />}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <motion.div 
                    variants={glowAnimation}
                    initial="initial"
                    animate="animate"
                    className="p-2 bg-primary/10 rounded-lg shrink-0"
                  >
                    <Award className="w-5 h-5 text-primary" />
                  </motion.div>
                  <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                    <p className="text-sm text-muted-foreground">{t('nav.assignments')}</p>
                    <motion.p 
                      variants={pulseAnimation}
                      initial="initial"
                      animate="animate"
                      className="text-xl sm:text-2xl font-semibold text-foreground"
                    >
                      <span className="text-green-600 dark:text-green-400">{completedAssignments}</span>
                      {' / '}
                      {totalAssignments}
                    </motion.p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Topic Levels */}
          <div className="mt-6">
            <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Brain className="w-5 h-5 text-primary shrink-0" />
              <h2 className={`text-base sm:text-xl font-semibold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                {t('practice.title')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(studentData?.topicLevels || {}).sort().map(([topic, level]) => {
                // Skip if level is undefined or null
                if (!level) return null;
                
                return (
                  <Card key={topic} className="p-4 border-primary/20 bg-background">
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                        <p className="text-sm text-muted-foreground">{t(`practice.topics.${topic}.title`)}</p>
                        <p className="text-xl sm:text-2xl font-semibold text-foreground">{Number(level).toFixed(1)}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </motion.div>

        {assignments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Active Assignments Section */}
            {activeAssignments.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ClockIcon className="w-5 h-5 text-yellow-500 shrink-0" />
                  <h2 className={`text-base sm:text-xl font-semibold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                    {t('activeAssignments')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAssignments.map((assignment) => (
                    <AssignmentCard key={`active-${assignment._id}`} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}

            {/* Late Assignments Section */}
            {lateAssignments.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ClockIcon className="w-5 h-5 text-red-500 shrink-0" />
                  <h2 className={`text-base sm:text-xl font-semibold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                    {t('lateAssignments')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lateAssignments.map((assignment) => (
                    <AssignmentCard key={`late-${assignment._id}`} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Assignments Section */}
            {completedAssignmentsList.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <h2 className={`text-base sm:text-xl font-semibold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                    {t('assignmentHistory')}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedAssignmentsList.map((assignment) => (
                    <AssignmentCard key={`completed-${assignment._id}`} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default StudentDashboard;
