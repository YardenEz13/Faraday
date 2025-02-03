import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { getStudentStatistics } from '../services/api';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

function StudentStatisticsTable() {
  const { t, i18n } = useTranslation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await getStudentStatistics();
        setStudents(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 dark:bg-muted/50 text-muted-foreground dark:text-muted-foreground">
            <TableHead className={`text-xs font-bold uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.studentName')}</TableHead>
            <TableHead className={`text-xs font-bold uppercase ${isRTL ? 'text-right' : 'text-left'}`}>{t('students.email')}</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">{t('common.mathLevel')}</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">{t('common.progress')}</TableHead>
            <TableHead className="text-xs font-bold uppercase text-center">{t('common.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student._id}>
              <TableCell className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{student.username}</TableCell>
              <TableCell className={isRTL ? 'text-right' : 'text-left'}>{student.email}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="bg-primary/10">
                  {student.mathLevel?.toFixed(1) || '1.0'}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Progress value={student.progress || 0} className="w-20" />
                  <span className="text-sm text-muted-foreground">
                    {student.progress ? `${Math.round(student.progress)}%` : '0%'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={student.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {t(`students.${student.status || 'inactive'}`)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StudentStatisticsTable; 