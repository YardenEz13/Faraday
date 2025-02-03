import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClasses, createClass, deleteClass } from '../services/api';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Trash2, PenSquare, School } from 'lucide-react';
import StudentSearch from '../components/StudentSearch';
import { motion, AnimatePresence } from 'framer-motion';

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

const classCard = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [newClassName, setNewClassName] = useState({ he: '', en: '' });
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error(t('errors.fetchClasses'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    try {
      if (!newClassName.he.trim() || !newClassName.en.trim()) {
        toast.error(t('errors.classNameRequired'));
        return;
      }

      await createClass({ name: newClassName });
      toast.success(t('success.classCreated'));
      setNewClassName({ he: '', en: '' });
      setIsCreating(false);
      fetchClasses();
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(t('errors.createClass'));
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm(t('confirmations.deleteClass'))) {
      try {
        await deleteClass(classId);
        toast.success(t('success.classDeleted'));
        fetchClasses();
      } catch (error) {
        console.error('Error deleting class:', error);
        toast.error(t('errors.deleteClass'));
      }
    }
  };

  const handleStudentAdded = async () => {
    await fetchClasses();
  };

  const getLocalizedClassName = (classItem) => {
    if (typeof classItem.name === 'string') {
      return classItem.name;
    }
    return classItem.name?.[i18n.language] || classItem.name?.en || classItem.name?.he || t('untitled');
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
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${isRTL ? 'font-yarden' : 'font-inter'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <School className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className={`text-lg sm:text-2xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('classes.title')}
          </h1>
        </div>

        <Button 
          variant="outline" 
          className={`gap-2 group hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={() => setIsCreating(true)}
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          {t('classes.createClass')}
        </Button>
      </motion.div>

      {classes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-background to-muted/50">
            <p className="text-muted-foreground">{t('classes.noClassesDesc')}</p>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {classes.map((classItem) => (
              <motion.div
                key={classItem._id}
                variants={classCard}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background to-muted/50 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-lg font-semibold">{getLocalizedClassName(classItem)}</span>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                          onClick={() => {
                            setEditingClass(classItem);
                            setIsEditing(true);
                          }}
                        >
                          <PenSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                          onClick={() => handleDeleteClass(classItem._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {t('classes.students', { count: classItem.students?.length || 0 })}
                      </span>
                    </div>
                    {editingClass?._id === classItem._id && (
                      <StudentSearch
                        onStudentAdded={handleStudentAdded}
                        excludeStudentIds={classItem.students}
                        classId={classItem._id}
                        mode="class"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Class Dialog */}
      <AnimatePresence>
        {isCreating && (
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('classes.createClass')}</DialogTitle>
                <DialogDescription>
                  {t('classes.createClassDesc')}
                </DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label htmlFor="name-he">{t('classes.nameHebrew')}</Label>
                    <Input
                      id="name-he"
                      value={newClassName.he}
                      onChange={(e) => setNewClassName(prev => ({ ...prev, he: e.target.value }))}
                      placeholder={t('classes.nameHebrewPlaceholder')}
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name-en">{t('classes.nameEnglish')}</Label>
                    <Input
                      id="name-en"
                      value={newClassName.en}
                      onChange={(e) => setNewClassName(prev => ({ ...prev, en: e.target.value }))}
                      placeholder={t('classes.nameEnglishPlaceholder')}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className={`flex justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewClassName({ he: '', en: '' });
                      setIsCreating(false);
                    }}
                  >
                    {t('back')}
                  </Button>
                  <Button
                    onClick={handleCreateClass}
                    className="group hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                    {t('classes.create')}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Edit Class Dialog */}
      <AnimatePresence>
        {isEditing && editingClass && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{t('classes.edit')}</DialogTitle>
                <DialogDescription>
                  {t('classes.editClassDesc')}
                </DialogDescription>
              </DialogHeader>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 pt-4"
              >
                <StudentSearch
                  onStudentAdded={handleStudentAdded}
                  excludeStudentIds={editingClass.students}
                  classId={editingClass._id}
                  mode="class"
                />
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 