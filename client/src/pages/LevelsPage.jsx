import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStudentDashboard, getStudentDetails } from '../services/api';
import { Card } from '@/components/ui/card';
import { Brain, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../providers/auth';
import { Progress } from '@/components/ui/progress';

function LevelsPage() {
  const { t, i18n } = useTranslation();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'he';
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      let response;
      if (studentId) {
        // Teacher viewing a specific student's levels
        response = await getStudentDetails(studentId);
        setStudentData(response);
      } else {
        // Student viewing their own levels
        response = await getStudentDashboard();
        if (response && response.student) {
          setStudentData(response.student);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error(t('dashboard.dashboardError'));
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              variant="ghost" 
              asChild
              className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Link to={user.role === 'teacher' ? '/students' : '/dashboard/student'}>
                <ArrowLeft className="w-4 h-4" />
                {t('levels.back')}
              </Link>
            </Button>
          </div>

          <div className={`flex items-center gap-3 mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Brain className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {studentId ? t('levels.studentLevels', { name: studentData?.username }) : t('levels.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('levels.description')}
              </p>
            </div>
          </div>

          {/* Overall Math Level */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t('levels.overallMathLevel')}</h2>
              <div className="text-2xl font-bold text-primary">
                {studentData?.mathLevel?.toFixed(1) || '1.0'}
              </div>
            </div>
            <Progress value={(studentData?.mathLevel || 1) * 10} className="h-2" />
          </Card>

          {/* Topic Levels */}
          <div>
            <h2 className="text-lg font-semibold mb-4">{t('levels.topicLevels')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(studentData?.topicLevels || {}).map(([topic, level]) => (
                <Card key={topic} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{t(`practice.topics.${topic}.title`)}</h3>
                    <div className="text-lg font-semibold text-primary">
                      {Number(level).toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {t(`practice.topics.${topic}.description`)}
                  </p>
                  <Progress value={Number(level) * 10} className="h-1.5" />
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LevelsPage; 