import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { BookOpen, ClockIcon, CheckCircle } from "lucide-react";
import { getStudentAssignments } from "../services/api";
import { AssignmentCard } from "../components/AssignmentCard";
import { useTranslation } from 'react-i18next';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState({
    activeAssignments: [],
    submittedAssignments: [],
    lateAssignments: [],
    stats: {
      totalAssignments: 0,
      completedAssignments: 0,
      lateAssignments: 0,
      activeAssignments: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await getStudentAssignments();
      console.log('Assignments response:', response);
      setAssignments(response);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments({
        activeAssignments: [],
        submittedAssignments: [],
        lateAssignments: [],
        stats: {
          totalAssignments: 0,
          completedAssignments: 0,
          lateAssignments: 0,
          activeAssignments: 0
        }
      });
    } finally {
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

  const { activeAssignments, submittedAssignments, lateAssignments, stats } = assignments;
  const hasAssignments = stats.totalAssignments > 0;

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${isRTL ? 'font-yarden' : 'font-inter'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={`flex items-center gap-2 mb-4 sm:mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <BookOpen className="w-6 h-6 text-primary shrink-0" />
        <h1 className={`text-lg sm:text-2xl font-bold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('myAssignments')}
        </h1>
      </div>

      {!hasAssignments ? (
        <Card className="text-center p-4 sm:p-6 border-primary/20 bg-background">
          <CardContent>
            <p className={`text-sm sm:text-base text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('noAssignmentsDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Assignments */}
          {activeAssignments.length > 0 && (
            <div>
              <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ClockIcon className="w-5 h-5 text-yellow-500 shrink-0" />
                <h2 className={`text-base sm:text-lg font-semibold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('activeAssignments')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {activeAssignments.map(assignment => (
                  <AssignmentCard key={assignment._id} assignment={assignment} />
                ))}
              </div>
            </div>
          )}

          {/* Late Assignments */}
          {lateAssignments.length > 0 && (
            <div>
              <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <ClockIcon className="w-5 h-5 text-red-500 shrink-0" />
                <h2 className={`text-base sm:text-lg font-semibold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('lateAssignments')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {lateAssignments.map(assignment => (
                  <AssignmentCard key={assignment._id} assignment={assignment} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Assignments */}
          {submittedAssignments.length > 0 && (
            <div>
              <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                <h2 className={`text-base sm:text-lg font-semibold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t('completedAssignments')}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {submittedAssignments.map(assignment => (
                  <AssignmentCard key={assignment._id} assignment={assignment} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 