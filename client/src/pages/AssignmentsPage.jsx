import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Plus, ChevronRight, Sparkles, Target } from 'lucide-react';
import { getAssignments } from '../services/api';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { he, enUS } from 'date-fns/locale';

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

const floatingIcon = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1,
    opacity: 0.5,
    transition: {
      repeat: Infinity,
      repeatType: "reverse",
      duration: 3
    }
  }
};

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-teal-500',
    gradient: 'from-teal-500/10 to-transparent',
    bgGradient: 'from-teal-500/5 via-background to-background'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-transparent',
    bgGradient: 'from-emerald-500/5 via-background to-background'
  },
  late: {
    icon: XCircle,
    color: 'text-red-500',
    gradient: 'from-red-500/10 to-transparent',
    bgGradient: 'from-red-500/5 via-background to-background'
  },
  active: {
    icon: AlertCircle,
    color: 'text-green-500',
    gradient: 'from-green-500/10 to-transparent',
    bgGradient: 'from-green-500/5 via-background to-background'
  }
};

export default function AssignmentsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAssignment, setHoveredAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error(t('errors.fetchAssignments'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return t('dateNotAvailable');
    return format(new Date(date), 'PPp', {
      locale: isRTL ? he : enUS
    });
  };

  const getLocalizedTitle = (assignment) => {
    if (typeof assignment.title === 'string') {
      return assignment.title;
    }
    return assignment.title?.[i18n.language] || assignment.title?.en || assignment.title?.he || t('untitled');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <motion.div 
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 1, rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-8 w-8 border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isRTL ? 'font-yarden' : 'font-inter'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between mb-12 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="relative">
            <motion.div 
              className="p-3 rounded-2xl bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <BookOpen className="w-8 h-8 text-teal-500" />
            </motion.div>
            <motion.div
              variants={floatingIcon}
              initial="initial"
              animate="animate"
              className="absolute -top-3 -right-3"
            >
              <Target className="w-6 h-6 text-emerald-500/30" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {t('assignments.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('assignments.description')}
            </p>
          </div>
        </div>

        <Button 
          variant="outline"
          className={`gap-2 group hover:bg-teal-500 hover:text-teal-50 transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={() => navigate('/assignments/create')}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          {t('assignments.create')}
        </Button>
      </motion.div>

      {assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Card className="p-8 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
            <motion.div
              variants={floatingIcon}
              initial="initial"
              animate="animate"
              className="mx-auto w-16 h-16 mb-4 text-primary/30"
            >
              <Sparkles className="w-full h-full" />
            </motion.div>
            <p className="text-lg text-muted-foreground">{t('assignments.noAssignments')}</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {assignments.map((assignment) => {
              const status = assignment.status || 'pending';
              const StatusIcon = statusConfig[status].icon;
              const isHovered = hoveredAssignment === assignment._id;

              return (
                <motion.div
                  key={assignment._id}
                  variants={item}
                  layout
                  whileHover={{ scale: 1.02 }}
                  onHoverStart={() => setHoveredAssignment(assignment._id)}
                  onHoverEnd={() => setHoveredAssignment(null)}
                  onClick={() => navigate(`/assignments/${assignment._id}`)}
                  className="cursor-pointer group"
                >
                  <Card className={`relative overflow-hidden border-primary/20 bg-gradient-to-br ${statusConfig[status].bgGradient} hover:shadow-lg transition-all duration-300 group`}>
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${statusConfig[status].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    />
                    <CardHeader className="relative border-b border-primary/10">
                      <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <motion.div 
                          className={`p-2 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${statusConfig[status].color} group-hover:scale-110`}
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <StatusIcon className="w-5 h-5" />
                        </motion.div>
                        <span className="text-lg group-hover:text-primary transition-colors duration-300">
                          {getLocalizedTitle(assignment)}
                        </span>
                      </CardTitle>
                      <CardDescription className={`mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t(`assignments.${status}`)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative pt-4">
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={`flex flex-col gap-3 ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{t('assignments.dueDate')}:</span>{' '}
                          {formatDate(assignment.dueDate)}
                        </div>
                        {assignment.grade && (
                          <div className="text-sm">
                            <span className="font-medium">{t('assignments.grade')}:</span>{' '}
                            <span className={statusConfig[status].color}>{assignment.grade}</span>
                          </div>
                        )}
                        <motion.div
                          animate={{ x: isHovered ? (isRTL ? -5 : 5) : 0 }}
                          className={`flex items-center gap-1 text-sm text-primary mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <span>{t('assignments.viewAssignment')}</span>
                          <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
} 