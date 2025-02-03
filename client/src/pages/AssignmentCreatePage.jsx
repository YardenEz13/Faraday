import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QUESTIONS_BANK } from '@/data/questionsBank';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createAssignment } from '@/services/api';

const TOPICS = {
  equations: "equations",
  trigonometry: "trigonometry",
  vectors: "vectors",
  complex: "complex",
  calculus: "calculus",
  sequences: "sequences",
  geometry: "geometry",
  probability: "probability"
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function AssignmentCreatePage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [titleHe, setTitleHe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [teacherId, setTeacherId] = useState(null);

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
      const response = await fetch(`${API_BASE_URL}/api/classes`, {
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
    
    console.log('Setting titles:', { heTitle, enTitle });
    setTitleHe(heTitle);
    setTitleEn(enTitle);
  };

  const handleGenerateAssignment = () => {
    setLoading(true);
    try {
      // Get all questions for the selected topic
      const topicQuestions = QUESTIONS_BANK[selectedTopic];
      if (!topicQuestions || topicQuestions.length === 0) {
        throw new Error(t('errors.noQuestionsAvailable'));
      }

      // Generate questions using the generators
      const generatedQuestions = topicQuestions.map(q => q.generator());
      setQuestions(generatedQuestions);
      toast.success(t('success.questionsGenerated'));
    } catch (error) {
      console.error('Error generating assignment:', error);
      toast.error(error.message);
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

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    if (!teacherId) {
      toast.error(t('errors.unauthorized'));
      return;
    }

    // Validate required fields
    if (!selectedTopic || !dueDate) {
      toast.error(t('assignments.missingFields'));
      return;
    }

    if (!selectedClassId) {
      toast.error(t('assignments.selectClass'));
      return;
    }

    try {
      const assignmentData = {
        topic: selectedTopic,
        title: {
          he: titleHe,
          en: titleEn
        },
        dueDate: dueDate,
        teacherId: teacherId,
        classId: selectedClassId,
        questions: questions || []
      };

      console.log('Creating assignment with data:', assignmentData);

      const response = await createAssignment(assignmentData);
      console.log('Assignment creation response:', response);

      if (response) {
        toast.success(t('assignments.created'));
        navigate('/assignments');
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error(t('assignments.errorCreating'));
    }
  };

  return (
    <div className={`container mx-auto p-4 ${isRTL ? 'font-yarden' : 'font-inter'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="text-2xl font-bold mb-4">{t('createAssignment.title')}</h1>
      
      <div className="grid gap-4 mb-4">
        <div>
          <Label>{t('createAssignment.selectTopic')}</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TOPICS).map(([key, value]) => (
              <Card 
                key={key}
                className={`cursor-pointer ${selectedTopic === key ? 'border-primary' : ''}`}
                onClick={() => handleTopicSelect(key)}
              >
                <CardHeader>
                  <CardTitle>{t(`practice.topics.${value}.title`)}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {selectedTopic && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label>{t('createAssignment.assignmentTitle')}</Label>
            <p className="mt-2 text-lg font-semibold">
              {isRTL ? titleHe : titleEn}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isRTL ? titleEn : titleHe}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
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

          <div>
            <Label>{t('createAssignment.dueDate')}</Label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="[color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <Button
            onClick={handleGenerateAssignment}
            disabled={!selectedTopic || loading}
          >
            {loading ? t('loading') : t('createAssignment.generateQuestions')}
          </Button>
          <Button
            onClick={handleCreateAssignment}
            disabled={!titleHe || !titleEn || !questions.length || !dueDate || !selectedClassId || loading}
            variant="default"
          >
            {loading ? t('loading') : t('createAssignment.create')}
          </Button>
        </div>

        {questions.length > 0 && (
          <div className="grid gap-4">
            <h2 className="text-xl font-bold">{isRTL ? titleHe : titleEn}</h2>
            {questions.map((question, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">{question.title}</h3>
                  <p className="mb-2">{question.description}</p>
                  <p className="font-mono bg-gray-100 p-2 rounded dark:bg-gray-800 dark:text-white">{question.equation}</p>
                  {question.hints && (
                    <div className="mt-2">
                      <p className="font-bold">{t('hints')}:</p>
                      <ul className="list-disc list-inside">
                        {question.hints.map((hint, hintIndex) => (
                          <li key={hintIndex}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 