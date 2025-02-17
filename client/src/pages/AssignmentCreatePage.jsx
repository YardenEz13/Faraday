import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createAdaptiveAssignment } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Calculator, ChevronRight, Sigma, Triangle, ArrowUpRight, Infinity, LineChart, Box, Percent, Plus, BookOpen, Target, CheckCircle } from 'lucide-react';

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

const topics = [
  { 
    id: 'equations',
    icon: Calculator,
    color: 'text-teal-500',
    gradient: 'from-teal-500/10 to-transparent'
  },
  { 
    id: 'trigonometry',
    icon: Triangle,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-transparent'
  },
  { 
    id: 'vectors',
    icon: ArrowUpRight,
    color: 'text-green-500',
    gradient: 'from-green-500/10 to-transparent'
  },
  { 
    id: 'complex',
    icon: Infinity,
    color: 'text-teal-600',
    gradient: 'from-teal-600/10 to-transparent'
  },
  { 
    id: 'calculus',
    icon: LineChart,
    color: 'text-emerald-600',
    gradient: 'from-emerald-600/10 to-transparent'
  },
  { 
    id: 'sequences',
    icon: Sigma,
    color: 'text-green-600',
    gradient: 'from-green-600/10 to-transparent'
  },
  { 
    id: 'geometry',
    icon: Box,
    color: 'text-teal-500',
    gradient: 'from-teal-500/10 to-transparent'
  },
  { 
    id: 'probability',
    icon: Percent,
    color: 'text-emerald-500',
    gradient: 'from-emerald-500/10 to-transparent'
  }
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AssignmentCreatePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [teacherId, setTeacherId] = useState(null);
  const [hoveredTopic, setHoveredTopic] = useState(null);

  useEffect(() => {
    fetchClasses();
    // Get teacherId from token
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      if (decodedToken && decodedToken.id) {
        setTeacherId(decodedToken.id);
      } else {
        console.error('No teacher ID found in token');
        toast.error(t('errors.unauthorized'));
        navigate('/login');
      }
    } else {
      console.error('No token found');
      toast.error(t('errors.unauthorized'));
      navigate('/login');
    }
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/classes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('errors.fetchClasses'));
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    
    // Save current language
    const currentLang = i18n.language;
    
    // Switch to Hebrew and get Hebrew title
    i18n.changeLanguage('he');
    const heTitle = t('assignments.topicAssignment', { 
      topic: t(`practice.topics.${topic}.title`),
      interpolation: { escapeValue: false }
    });
    
    // Switch to English and get English title
    i18n.changeLanguage('en');
    const enTitle = t('assignments.topicAssignment', { 
      topic: t(`practice.topics.${topic}.title`),
      interpolation: { escapeValue: false }
    });
    
    // Restore original language
    i18n.changeLanguage(currentLang);
    
    setTitleHe(heTitle);
    setTitleEn(enTitle);
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      toast.error(t('errors.unauthorized'));
      return;
    }

    if (!selectedTopic || !dueDate) {
      toast.error(t('assignments.missingFields'));
      return;
    }

    if (!selectedClassId) {
      toast.error(t('assignments.selectClass'));
      return;
    }

    try {
      setLoading(true);
      const assignmentData = {
        topic: selectedTopic,
        title: {
          he: titleHe,
          en: titleEn
        },
        dueDate: dueDate,
        teacherId: teacherId,
        classId: selectedClassId,
        isAdaptive: true,
        minQuestionsRequired: 5,
        successRateThreshold: 0.7
      };

      const response = await createAdaptiveAssignment(assignmentData);

      if (response) {
        toast.success(t('assignments.created'));
        navigate('/assignments');
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(t('assignments.errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  };

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
        className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <BookOpen className="w-8 h-8 text-teal-500" />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
            {t('createAssignment.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('createAssignment.description')}</p>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
      >
        <AnimatePresence mode="popLayout">
          {topics.map((topic) => {
            const TopicIcon = topic.icon;
            const isHovered = hoveredTopic === topic.id;
            const isSelected = selectedTopic === topic.id;

            return (
              <motion.div
                key={topic.id}
                variants={item}
                layout
                whileHover={{ 
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
                onHoverStart={() => setHoveredTopic(topic.id)}
                onHoverEnd={() => setHoveredTopic(null)}
                onClick={() => handleTopicSelect(topic.id)}
                className="cursor-pointer group"
              >
                <Card className={`relative overflow-hidden border-primary/20 ${isSelected ? 'bg-primary/5 border-primary' : 'bg-gradient-to-br from-background to-muted/50'} hover:shadow-lg transition-all duration-300`}>
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${topic.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                  <CardHeader className="relative">
                    <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <motion.div 
                        className={`p-2 rounded-xl bg-background/80 backdrop-blur-sm shadow-sm ${topic.color} group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <TopicIcon className="w-5 h-5" />
                      </motion.div>
                      <span className="group-hover:text-primary transition-colors duration-300">
                        {t(`practice.topics.${topic.id}.title`)}
                      </span>
                    </CardTitle>
                    <CardDescription className={isRTL ? 'text-right' : 'text-left'}>
                      {t(`practice.topics.${topic.id}.description`)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative pb-4">
                    <motion.div
                      animate={{ 
                        x: isHovered ? (isRTL ? -5 : 5) : 0,
                        transition: { type: "spring", stiffness: 300, damping: 10 }
                      }}
                      className={`flex items-center gap-1 text-sm ${topic.color} ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <span>{isSelected ? t('selected') : t('selectTopic')}</span>
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform duration-300`} />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {selectedTopic && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-6"
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{t('createAssignment.details')}</CardTitle>
              <CardDescription>{t('createAssignment.detailsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t('createAssignment.selectClass')}</Label>
                <Select 
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createAssignment.selectClass')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem._id} value={classItem._id}>
                        {classItem.name[i18n.language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('createAssignment.dueDate')}</Label>
                <Input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="[color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>

              <Card className="border-primary/10 bg-primary/5">
                <CardContent className="p-4">
                  <div className={`flex items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Target className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{t('assignments.adaptiveMode')}</h3>
                  </div>
                  <ul className={`space-y-2 text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                    <li className="flex items-center gap-2">
                      <Brain className="w-4 h-4 shrink-0" />
                      {t('assignments.adaptiveDesc1')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4 shrink-0" />
                      {t('assignments.adaptiveDesc2')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {t('assignments.adaptiveDesc3')}
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={handleCreateAssignment}
                disabled={!titleHe || !titleEn || !dueDate || !selectedClassId || loading}
                className="w-full group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                {loading ? t('loading') : t('createAssignment.create')}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
} 