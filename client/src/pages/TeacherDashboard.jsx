import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherDashboard, deleteAssignment } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { toast } from "react-hot-toast";
import { Users, Trash2, GraduationCap, BookOpen, Brain, CheckCircle, Plus } from "lucide-react";
import StudentSearch from '../components/StudentSearch';
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

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

const statCard = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function TeacherDashboard() {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    stats: {
      totalStudents: 0,
      totalAssignments: 0,
      averageMathLevel: 0,
      completedAssignments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchDashboard();
  }, [refreshTrigger]);

  // Add automatic refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Add focus event listener to refresh data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchDashboard = async () => {
    try {
      const students = await getTeacherDashboard();
      console.log('Teacher dashboard response:', students);
      
      if (Array.isArray(students)) {
        const totalStudents = students.length;
        const totalAssignments = students.reduce((sum, student) => 
          sum + student.stats.totalAssignments, 0);
        const completedAssignments = students.reduce((sum, student) => 
          sum + student.stats.completedAssignments, 0);
        const averageMathLevel = students.length > 0 
          ? students.reduce((sum, student) => sum + (student.mathLevel || 1), 0) / students.length 
          : 0;

        setDashboardData({
          students,
          stats: {
            totalStudents,
            totalAssignments,
            averageMathLevel: Math.round(averageMathLevel * 10) / 10,
            completedAssignments
          }
        });
      } else {
        console.error('Unexpected data format:', students);
        setDashboardData({
          students: [],
          stats: {
            totalStudents: 0,
            totalAssignments: 0,
            averageMathLevel: 0,
            completedAssignments: 0
          }
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Error loading dashboard');
      setDashboardData({
        students: [],
        stats: {
          totalStudents: 0,
          totalAssignments: 0,
          averageMathLevel: 0,
          completedAssignments: 0
        }
      });
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const handleStudentAdded = async () => {
    await fetchDashboard();
    setIsAddingStudents(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData.students || dashboardData.students.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
              {t('students.title')}
            </h1>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 sm:p-6 text-center border-primary/20">
              <p className={`text-sm sm:text-base text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('noAssignmentsDesc')}
              </p>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <StudentSearch onStudentAdded={handleStudentAdded} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${isRTL ? 'font-yarden' : 'font-inter'}`} 
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className={`text-lg sm:text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('dashboard.title')}
          </h1>
        </div>

        <Button 
          variant="outline" 
          className={`gap-2 group hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={() => setIsAddingStudents(true)}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          {t('students.assignToTeacher')}
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
      >
        <motion.div variants={statCard}>
          <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-shadow duration-200">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                <p className="text-sm text-muted-foreground">{t('dashboard.totalStudents')}</p>
                <p className="text-xl sm:text-2xl font-semibold">{dashboardData.stats.totalStudents}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={statCard}>
          <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-shadow duration-200">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                <p className="text-sm text-muted-foreground">{t('dashboard.averageMathLevel')}</p>
                <p className="text-xl sm:text-2xl font-semibold">{dashboardData.stats.averageMathLevel.toFixed(1)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={statCard}>
          <Card className="p-4 border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-shadow duration-200">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div className={`${isRTL ? 'font-yarden text-right' : 'font-inter text-left'}`}>
                <p className="text-sm text-muted-foreground">{t('dashboard.assignmentsCompleted')}</p>
                <p className="text-xl sm:text-2xl font-semibold">
                  <span className="text-green-600 dark:text-green-400">{dashboardData.stats.completedAssignments}</span>
                  {' / '}
                  {dashboardData.stats.totalAssignments}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main content - student cards */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-2 space-y-4 sm:space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {dashboardData.students.map((student) => (
              <motion.div
                key={student._id}
                variants={item}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="p-4 sm:p-6 border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-200">
                  <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <div className={`${isRTL ? 'font-yarden text-right w-full sm:w-auto' : 'font-inter text-left w-full sm:w-auto'}`}>
                      <h2 className="text-base sm:text-xl font-semibold">{student.username}</h2>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      asChild
                      className={`w-full sm:w-auto group hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isRTL ? 'font-yarden' : 'font-inter'}`}
                    >
                      <Link to={`/assignment/create/${student._id}`} className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        {t('assignments.assignHomework')}
                      </Link>
                    </Button>
                  </div>

                  <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    <div className="bg-primary/10 px-3 py-1 rounded-full">
                      <span className={`text-sm text-primary ${isRTL ? 'font-yarden' : 'font-inter'}`}>
                        {t('students.mathLevel')} {student.mathLevel?.toFixed(1) || '1.0'}
                      </span>
                    </div>
                    <div className="bg-primary/10 px-3 py-1 rounded-full">
                      <span className={`text-sm text-primary ${isRTL ? 'font-yarden' : 'font-inter'}`}>
                        {t('students.progress')}: {student.stats.progress || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <h3 className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('dashboard.recentAssignments')}
                    </h3>
                    <AnimatePresence mode="popLayout">
                      {Array.isArray(student.assignments) && student.assignments.length > 0 ? (
                        <motion.div 
                          variants={container}
                          initial="hidden"
                          animate="show"
                          className="space-y-2"
                        >
                          {student.assignments.map((assignment, index) => (
                            <motion.div
                              key={assignment._id || `${student._id}-assignment-${index}`}
                              variants={item}
                              className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-muted/50 hover:bg-muted/70 rounded-lg transition-all duration-200 ${isRTL ? 'sm:flex-row-reverse' : ''}`}
                            >
                              <Link 
                                to={`/assignment/${assignment._id}`}
                                className="flex-1 w-full group"
                              >
                                <div className={isRTL ? 'text-right' : 'text-left'}>
                                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                                    {typeof assignment.title === 'object' ? 
                                      (assignment.title[i18n.language] || assignment.title.en || assignment.title.he) : 
                                      (assignment.title || t('untitled'))}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {t('dueDate')}: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'Invalid Date'}
                                  </div>
                                </div>
                                <div className={`text-xs mt-1 ${(assignment.status === 'submitted' || assignment.status === 'graded') ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                  {(assignment.status === 'submitted' || assignment.status === 'graded') ? t('completed') : t('pending')}
                                </div>
                              </Link>
                              {assignment._id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:bg-destructive/10 hover:text-destructive shrink-0 group"
                                  onClick={() => handleDeleteAssignment(assignment._id)}
                                >
                                  <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          {t('noRecentAssignments')}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Student search sidebar */}
        <div className="lg:col-span-1">
          <StudentSearch onStudentAdded={handleStudentAdded} />
        </div>
      </div>

      {/* Dialog for adding students */}
      <AnimatePresence>
        {isAddingStudents && (
          <Dialog open={isAddingStudents} onOpenChange={setIsAddingStudents}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('students.assignToTeacher')}</DialogTitle>
              </DialogHeader>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 pt-4"
              >
                <StudentSearch 
                  onStudentAdded={handleStudentAdded}
                  excludeStudentIds={dashboardData.students.map(s => s._id) || []}
                  mode="teacher"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
