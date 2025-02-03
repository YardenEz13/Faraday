import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { getUnassignedStudents, assignStudent } from '../services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, UserPlus } from 'lucide-react';

export default function StudentSearch({ onStudentAdded, excludeStudentIds, classId, mode = 'class' }) {
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchStudents();
  }, [mode, classId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Pass mode and classId as query parameters
      const params = new URLSearchParams();
      params.append('mode', mode);
      if (classId) {
        params.append('classId', classId);
      }
      const data = await getUnassignedStudents(params);
      setUnassignedStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(t('errors.fetchStudents'));
      setUnassignedStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId) => {
    try {
      if (!studentId) {
        toast.error(t('errors.studentRequired'));
        return;
      }

      if (mode === 'class') {
        if (!classId) {
          toast.error(t('errors.classRequired'));
          return;
        }
        await assignStudent(studentId, classId);
      } else {
        await assignStudent(studentId);
      }

      onStudentAdded(studentId);
      toast.success(mode === 'class' ? t('success.studentAddedToClass') : t('success.studentAssignedToTeacher'));
    } catch (error) {
      console.error('Error assigning student:', error);
      if (error.response?.data?.error === 'Student is already in this class') {
        toast.error(t('errors.studentAlreadyInClass'));
      } else {
        toast.error(mode === 'class' ? t('errors.addStudent') : t('errors.assignStudent'));
      }
    }
  };

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

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-background to-muted/50 border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <UserPlus className="w-5 h-5 text-primary" />
          {mode === 'class' ? t('students.addStudent') : t('students.assignToTeacher')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : unassignedStudents.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            {t('students.noUnassignedStudents')}
          </motion.div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {unassignedStudents
              .filter(student => !excludeStudentIds?.includes(student._id))
              .map((student) => (
                <motion.div
                  key={student._id}
                  variants={item}
                  className={`flex items-center justify-between p-3 rounded-lg bg-card hover:bg-primary/5 transition-colors border border-primary/10 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <div className="font-medium text-foreground">{student.username}</div>
                    <div className="text-sm text-muted-foreground">{student.email}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignStudent(student._id)}
                    className={`group hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <Plus className="w-4 h-4 mr-1 group-hover:rotate-90 transition-transform duration-200" />
                    {mode === 'class' ? t('students.addStudent') : t('students.assign')}
                  </Button>
                </motion.div>
              ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
} 