import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { toast } from "react-hot-toast";
import { getTeacherDashboard } from '../services/api';
import { Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { useTranslation } from 'react-i18next';
import { Progress } from "../components/ui/progress";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getTeacherDashboard();
      console.log('Teacher dashboard response:', response);
      setStudents(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(t('students.errorLoading'));
      setLoading(false);
    }
  };

  const handleRowClick = (student) => {
    navigate(`/levels/${student._id}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('students.loading')}</div>;
  }

  return (
    <div className={`p-8 ${isRTL ? 'font-yarden' : 'font-inter'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">{t('students.title')}</h1>
        </div>
        <Button asChild>
          <Link to="/students/add">{t('students.addNew')}</Link>
        </Button>
      </div>

      <Card className="border-primary/20 dark:border-primary/20">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 dark:hover:bg-muted/50">
              <TableHead className={`font-semibold text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.studentName')}</TableHead>
              <TableHead className={`font-semibold text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.email')}</TableHead>
              <TableHead className={`font-semibold text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.mathLevel')}</TableHead>
              <TableHead className={`font-semibold text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.progress')}</TableHead>
              <TableHead className={`font-semibold text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{t('nav.assignments')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow 
                key={student._id} 
                className="hover:bg-muted/50 dark:hover:bg-muted/50 cursor-pointer"
                onClick={() => handleRowClick(student)}
              >
                <TableCell className={`font-medium text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  {student.username}
                </TableCell>
                <TableCell className={`text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  {student.email}
                </TableCell>
                <TableCell className={`text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  <span className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-2 py-1 rounded-full">
                    {t('students.mathLevel')} {student.mathLevel?.toFixed(1) || '1.0'}
                  </span>
                </TableCell>
                <TableCell className={`text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${student.stats.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {student.stats.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className={`text-foreground dark:text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 dark:text-green-400">
                      {student.stats.completedAssignments}
                    </span>
                    {' / '}
                    <span className="text-foreground dark:text-foreground">
                      {student.stats.totalAssignments}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
} 