import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { assignStudentToTeacher } from '../../server/src/controllers/userController';
import { Edit } from 'lucide-react';

const resources = {
  en: {
    translation: {
      selectTopic:"Select Topic",
      assignHomework:"Assign Homework",
      mathLevel:"Math Level",
      noAssignments:"No Assignments Yet",
      noAssignmentsDesc:"You don't have any assignments at the moment.\nCheck back later for new assignments.",
      completionRate:"Completion Rate",
      myAssignments:"My Assignments",
      due:"Due",
      completed:"Completed",
      late:"Late",
      noAssignments:"No Assignments Yet",
      noAssignmentsDesc:"You don't have any assignments at the moment.\nCheck back later for new assignments.",
      
      common: {
        loading: "Loading...",
        assignmentHistory: "Assignment History",
        back: "Back",
        submit: "Submit",
        next: "Next",
        email: "Email",
        username: "Username",
        student: "Student",
        teacher: "Teacher",
        dueDate: "Due Date",
        status: "Status",
        grade: "Grade",
        mathLevel: "Math Level",
        completionRate: "Completion Rate",
        actions: "Actions",
        progress: "Progress",
        untitled: "Untitled",
        pleaseEnterAnswer: "Please enter an answer",
        submitted: "Assignment submitted successfully",
        switchToHebrew: "Switch to Hebrew",
        switchToEnglish: "Switch to English",
        language: "Language",
        viewAssignment: "View Assignment",
        completed: "Completed ✓",
        late: "Late!",
        due: "Due:"
      },
      auth: {
        username: "Username",
        email: "Email",
        login: "Login",
        register: "Register",
        fullName: "Full Name",
        password: "Password",
        role: "Role",
        loginDescription: "Enter your email below to login to your account",
        registerDescription: "Create a new account",
        emailPlaceholder: "m@example.com",
        namePlaceholder: "Enter your name",
        usernamePlaceholder: "Enter username",
        loggingIn: "Logging in...",
        registering: "Registering...",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        registerHere: "Register here",
        loginHere: "Login here",
        loginError: "Error logging in",
        registrationError: "Error registering"
      },
      assignments: {
        assignToTeacher:"Assign to Teacher",
        assignHomework:"Assign Homework",
        title: "My Assignments",
        noAssignments:"No Assignments Yet",
        noAssignmentsDesc:"You don't have any assignments at the moment.\nCheck back later for new assignments.",
        topicAssignment: "{{topic}} Assignment",
        description: "Manage and track your assignments",
        create: "Create Assignment",
        createDesc: "Create a new assignment for your students",
        viewAssignment: "View Assignment",
        dueDate: "Due Date",
        grade: "Grade",
        status: {
          active: "Active",
          submitted: "Submitted",
          graded: "Graded",
          late: "Late",
          pending: "Pending"
        },
        assignToTeacher: "Assign to Teacher",
        assignHomework: "Assign Homework",
        adaptiveMode: "Adaptive Learning Mode",
        adaptiveDesc1: "Questions adapt to each student's level",
        adaptiveDesc2: "Difficulty adjusts based on performance",
        adaptiveDesc3: "Personalized learning path for optimal progress"
      },
      nav: {
        dashboard: "Dashboard",
        assignments: "Assignments",
        createAssignment: "Create Assignment",
        students: "Students",
        practice: "Practice",
        logout: "Logout",
        classes: "Classes"
      },
      dashboard: {
        title: "My Dashboard",
        welcome: "Welcome",
        myAssignments: "My Assignments",
        activeAssignments: "Active Assignments",
        completedAssignments: "Completed Assignments",
        lateAssignments: "Late Assignments",
        noAssignments: "No Assignments Yet",
        noAssignmentsDesc: "You don't have any assignments at the moment.\nCheck back later for new assignments.",
        totalStudents: "Total Students",
        averageMathLevel: "Average Math Level",
        assignmentsCompleted: "Assignments Completed",
        pending: "Pending",
        recentAssignments: "Recent Assignments",
        noRecentAssignments: "No Recent Assignments",
        completed: "Completed",
        late: "Late",
        due: "Due",
        dateNotAvailable: "Date not available",
        comingSoon: "Coming soon",
        dashboardError: "Error loading dashboard",
        mathLevel: "Math Level",
        completionRate: "Completion Rate",
        assignmentHistory: "Assignment History",
        practiceTopics: "Practice Topics",
        viewAssignment: "View Assignment",
        homeworkInProbability: "Homework in Probability and Statistics"
      },
      classes: {
        title: "My Classes",
        edit: "Edit",
        editClass: "Edit Class",
        editClassDesc: "Edit the details of your class",
        noClasses: "No Classes Yet",
        noClassesDesc: "You don't have any classes at the moment.\nCheck back later for new classes.",
        createClass: "Create Class",
        createClassDescription: "Create a new class for your students",
        className: "Class Name",
        classNamePlaceholder: "Enter class name",
        classDescription: "Class Description",
        classDescriptionPlaceholder: "Enter class description",
        create: "Create",
        cancel: "Cancel",
        students: "{{count}} Students"
      },
      students: {
        addNew: "Add New Students",
        noUnassignedStudents: "No unassigned students",
        addStudent: "Add Students",
        assignToTeacher: "assign students",
        title: "My Students",
        studentName: "Student Name",
        email: "Email",
        mathLevel: "Math Level",
        progress: "Progress",
        viewAssignments: "View Assignments",
        loading: "Loading...",
        errorLoading: "Error loading students",
        completed: "Completed",
        active: "Active",
        inactive: "Inactive",
        status: "Status"
      },
      calculator: {
        title: "Calculator",
        open: "Open Calculator",
        close: "Close Calculator"
      },
      practice: {
        title: "Practice Topics",
        description: "Choose a topic for adaptive practice - difficulty will adjust to your math level",
        calculating: "Calculating",
        start: "Start Practice",
        yourAnswer: "Your Answer",
        enterAnswer: "Enter your answer here",
        topics: {
          equations: {
            title: "System of Equations",
            description: "Practice solving systems of equations and algebraic problems"
          },
          trigonometry: {
            title: "Trigonometry",
            description: "Master trigonometric functions and identities"
          },
          vectors: {
            title: "Vectors",
            description: "Learn vector operations and spatial geometry"
          },
          complex: {
            title: "Complex Numbers",
            description: "Work with complex numbers and their applications"
          },
          calculus: {
            title: "Calculus",
            description: "Study derivatives, integrals and limits"
          },
          sequences: {
            title: "Sequences",
            description: "Explore arithmetic and geometric sequences"
          },
          geometry: {
            title: "Analytic Geometry",
            description: "Discover geometric shapes and their properties"
          },
          probability: {
            title: "Probability & Statistics",
            description: "Learn probability theory and statistical analysis"
          }
        },
        difficulty: "Difficulty Level",
        score: "Score",
        streak: "Correct Streak",
        answerPlaceholder: "Enter your answer here",
        checking: "Checking...",
        submit: "Submit Answer",
        getHint: "Get Hint",
        hint: "Hint {{number}}",
        hideHint: "Hide Hint",
        showHint: "Show Hint",
        showSolution: "Show Solution",
        correct: "Correct!",
        incorrect: "Incorrect, try again",
        adaptivePractice: "Adaptive Practice",
        probabilityInputFormat: "Enter probability as a decimal (e.g., 0.25)",
        equationInputFormat: "Enter your answer in format: x=value, y=value",
        probabilityPlaceholder: "e.g., 0.25",
        equationPlaceholder: "e.g., x=5, y=3",
        messages: {
          correct: "Correct!",
          incorrect: "Incorrect, try again",
          enterAnswer: "Please enter an answer",
          invalidTopic: "Invalid topic",
          questionExpired: "Question expired, getting new question",
          topicMismatch: "Topic mismatch, getting new question",
          errorCheckingAnswer: "Error checking answer"
        },
        
        rewards: {
          streak: "{{count}} question streak! +{{points}} points",
          difficultyIncrease: "Difficulty increased! +{{points}} points"
        },
        questions: {
          title: "Question",
          description: "Description",
          equation: "Equation",
          answer: "Answer",
          steps: "Solution Steps",
          finalAnswer: "Final Answer",
          loading: "Loading question...",
          error: "Error loading question",
          retry: "Try Again",
          skip: "Skip Question",
          submit: "Submit Answer",
          next: "Next Question",
          previous: "Previous Question",
          progress: "Question {{current}} of {{total}}",
          timeRemaining: "Time Remaining: {{time}}",
          expired: "Time Expired",
          solution: "Solution",
          yourAnswer: "Your Answer"
        },
        errorGettingQuestion: "Error getting new question"
      },
      levels: {
        title: "Math Levels",
        description: "View your overall math level and individual topic levels",
        overallMathLevel: "Overall Math Level",
        topicLevels: "Topic Levels",
        back: "Back to Dashboard",
        studentLevels: "{{name}}'s Math Levels"
      },
      createAssignment: {
        title: "Create Assignment",
        description: "Create a new assignment for your students",
        details: "Assignment Details",
        detailsDesc: "Configure the assignment settings and adaptive learning parameters",
        selectTopic: "Select Topic",
        assignmentTitle: "Assignment Title",
        assignmentType: "Assignment Type",
        individual: "Individual",
        class: "Class",
        selectStudent: "Select Student",
        selectStudentPlaceholder: "Choose a student",
        selectClass: "Select Class",
        selectClassPlaceholder: "Choose a class",
        dueDate: "Due Date",
        dueDatePlaceholder: "mm/dd/yyyy --:-- --",
        generateQuestions: "Generate Questions",
        create: "Create Assignment",
        cancel: "Cancel",
        preview: "Preview",
        topics: {
          equations: "System of Equations",
          trigonometry: "Trigonometry",
          vectors: "Vectors",
          complex: "Complex Numbers",
          calculus: "Calculus",
          sequences: "Sequences",
          geometry: "Analytic Geometry",
          probability: "Probability & Statistics"
        }
      },
      errors: {
        fetchAssignments: "Error fetching assignments",
        fetchClasses: "Error fetching classes",
        createClass: "Error creating class",
        deleteClass: "Error deleting class",
        classNameRequired: "Class name is required"
      },
      success: {
        classCreated: "Class created successfully",
        classDeleted: "Class deleted successfully"
      },
      confirmations: {
        deleteClass: "Are you sure you want to delete this class?"
      },
      back: "Back",
      dateNotAvailable: "Date not available",
      loading: "Loading...",
      completed: "Completed",
      pending: "Pending",
      navigation: {
        practice: "Practice",
        dashboard: "Dashboard",
        assignments: "Assignments",
        students: "Students",
        classes: "Classes",
        logout: "Logout"
      },
      smallScreen: {
        practice: "Practice",
        dashboard: "Dashboard",
        assignments: "Assignments",
        students: "Students",
        classes: "Classes",
        logout: "Logout"
      }
    }
  },
  he: {
    translation: {
      selectTopic:"בחר נושא",
      selected:"נבחר",
      getHint:"קבל רמז",
      assignHomework:"צור שיעורי בית",
      assignmentHistory:"היסטוריית משימות",
      viewAssignment:"צפה במשימה",
      completionRate:"אחוז השלמה",
      myAssignments:"המשימות שלי",
      mathLevel:"רמת מתמטיקה",
      due:"להגשה עד",
      completed:"הושלם",
      noAssignments:"אין משימות עדיין",
      noAssignmentsDesc:"אין לך משימות כרגע.\nבדוק שוב מאוחר יותר למשימות חדשות.",
      dueDate:"תאריך הגשה",
    late:"באיחור",      
      common: {
        loading: "טוען...",
        back: "חזור",
        submit: "שלח",
        next: "הבא",
        email: "אימייל",
        username: "שם משתמש",
        student: "תלמיד",
        teacher: "מורה",
        dueDate: "תאריך הגשה",
        status: "סטטוס",
        grade: "ציון",
        mathLevel: "רמת מתמטיקה",
        completionRate: "אחוז השלמה",
        actions: "פעולות",
        progress: "התקדמות",
        untitled: "ללא כותרת",
        pleaseEnterAnswer: "אנא הכנס תשובה",
        submitted: "המטלה הוגשה בהצלחה",
        switchToHebrew: "עבור לעברית",
        switchToEnglish: "עבור לאנגלית",
        language: "שפה",
        viewAssignment: "צפה במטלה",
        completed: "הושלם ✓",
        late: "באיחור!",
        due: "להגשה:"
      },
      auth: {
        login: "התחברות",
        register: "הרשמה",
        fullName: "שם מלא",
        password: "סיסמה",
        role: "תפקיד",
        loginDescription: "הכנס את האימייל שלך כדי להתחבר לחשבון",
        registerDescription: "צור חשבון חדש",
        emailPlaceholder: "m@example.com",
        namePlaceholder: "הכנס את שמך",
        usernamePlaceholder: "הכנס שם משתמש",
        loggingIn: "מתחבר...",
        registering: "נרשם...",
        noAccount: "אין לך חשבון?",
        haveAccount: "כבר יש לך חשבון?",
        registerHere: "הירשם כאן",
        loginHere: "התחבר כאן",
        loginError: "שגיאה בהתחברות",
        registrationError: "שגיאה בהרשמה"
      },
      assignments: {
        assignToTeacher:"הוסף תלמידים",
        assignHomework:"צור שיעורי בית",
        title: "המשימות שלי",
        noAssignments:"אין משימות עדיין",
        noAssignmentsDesc:"אין לך משימות כרגע.\nבדוק שוב מאוחר יותר למשימות חדשות.",
        topicAssignment: "משימה ב{{topic}}",
        description: "ניהול ומעקב אחר המשימות שלך",
        create: "צור משימה",
        createDesc: "צור משימה חדשה לתלמידים שלך",
        viewAssignment: "צפה במשימה",
        dueDate: "תאריך הגשה",
        grade: "ציון",
        status: {
          active: "פעיל",
          submitted: "הוגש",
          graded: "נבדק",
          late: "באיחור",
          pending: "ממתין"
        },
        assignToTeacher: "שייך למורה",
        assignHomework: "תן שיעורי בית",
        adaptiveMode: "מצב למידה מסתגל",
        adaptiveDesc1: "השאלות מותאמות לרמת כל תלמיד",
        adaptiveDesc2: "רמת הקושי מתכווננת בהתאם לביצועים",
        adaptiveDesc3: "מסלול למידה מותאם אישית להתקדמות מיטבית"
      },
      calculator: {
        title: "מחשבון",
        open: "פתח מחשבון",
        close: "סגור מחשבון"
      },
      nav: {
        dashboard: "לוח בקרה",
        assignments: "משימות",
        createAssignment: "צור משימה",
        students: "תלמידים",
        practice: "תרגול",
        logout: "התנתק",
        classes: "כיתות"
      },
      dashboard: {
        title: "לוח הבקרה שלי",
        welcome: "ברוך הבא",
        myAssignments: "המטלות שלי",
        activeAssignments: "מטלות פעילות",
        completedAssignments: "מטלות שהושלמו",
        lateAssignments: "מטלות באיחור",
        noAssignments: "אין מטלות עדיין",
        noAssignmentsDesc: "אין לך מטלות כרגע.\nבדוק שוב מאוחר יותר למטלות חדשות.",
        totalStudents: "סך הכל תלמידים",
        averageMathLevel: "רמת מתמטיקה ממוצעת",
        assignmentsCompleted: "מטלות שהושלמו",
        pending: "ממתין",
        recentAssignments: "מטלות אחרונות",
        noRecentAssignments: "אין מטלות אחרונות",
        completed: "הושלם",
        late: "באיחור",
        due: "להגשה",
        dateNotAvailable: "תאריך לא זמין",
        comingSoon: "בקרוב",
        dashboardError: "שגיאה בטעינת לוח הבקרה",
        mathLevel: "רמת מתמטיקה",
        completionRate: "אחוז השלמה",
        assignmentHistory: "היסטוריית מטלות",
        practiceTopics: "נושאי תרגול",
        viewAssignment: "צפה במטלה",
        homeworkInProbability: "שיעורי בית בהסתברות וסטטיסטיקה"
      },
      classes: {
        title: "הכיתות שלי",
        edit: "ערוך",
        editClass: "ערוך כיתה",
        editClassDesc: "ערוך את פרטי הכיתה",
        noClasses: "אין כיתות עדיין",
        noClassesDesc: "אין לך כיתות כרגע.\nבדוק שוב מאוחר יותר לכיתות חדשות.",
        createClass: "צור כיתה",
        createClassDescription: "צור כיתה חדשה לתלמידים שלך",
        className: "שם הכיתה",
        classNamePlaceholder: "הכנס שם כיתה",
        classDescription: "תיאור הכיתה",
        classDescriptionPlaceholder: "הכנס תיאור כיתה",
        create: "צור",
        cancel: "בטל",
        students: "{{count}} תלמידים"
      },
      students: {
        addNew: "הוסף תלמידים חדשים",
        noUnassignedStudents: "אין תלמידים ללא מורה",
        addStudent: "הוסף תלמיד",
        assignToTeacher: "הוסף תלמידים",
        title: "התלמידים שלי",
        studentName: "שם התלמיד",
        email: "אימייל",
        mathLevel: "רמת מתמטיקה",
        progress: "התקדמות",
        viewAssignments: "צפה במשימות",
        loading: "טוען...",
        errorLoading: "שגיאה בטעינת תלמידים",
        completed: "הושלם",
        active: "פעיל",
        inactive: "לא פעיל",
        status: "סטטוס"
      },
      practice: {
        title: "נושאי תרגול",
        description: "בחר נושא לתרגול מותאם אישית - רמת הקושי תותאם לרמת המתמטיקה שלך",
        calculating: "מחשב",
        start: "התחל תרגול",
        yourAnswer: "התשובה שלך",
        enterAnswer: "הכנס את תשובתך כאן",
        topics: {
          equations: {
            title: "מערכת משוואות",
            description: "תרגול פתרון מערכות משוואות ובעיות אלגבריות"
          },
          trigonometry: {
            title: "טריגונומטריה",
            description: "שליטה בפונקציות וזהויות טריגונומטריות"
          },
          vectors: {
            title: "וקטורים",
            description: "למידת פעולות וקטוריות וגאומטריה במרחב"
          },
          complex: {
            title: "מספרים מרוכבים",
            description: "עבודה עם מספרים מרוכבים ויישומיהם"
          },
          calculus: {
            title: "חשבון דיפרנציאלי",
            description: "לימוד נגזרות, אינטגרלים וגבולות"
          },
          sequences: {
            title: "סדרות",
            description: "חקירת סדרות חשבוניות והנדסיות"
          },
          geometry: {
            title: "גאומטריה אנליטית",
            description: "גילוי צורות גאומטריות ותכונותיהן"
          },
          probability: {
            title: "הסתברות וסטטיסטיקה",
            description: "לימוד תורת ההסתברות וניתוח סטטיסטי"
          }
        },
        difficulty: "רמת קושי",
        score: "ניקוד",
        streak: "רצף תשובות נכונות",
        answerPlaceholder: "הכנס את תשובתך כאן",
        checking: "בודק...",
        submit: "שלח תשובה",
        getHint: "קבל רמז",
        hint: "רמז {{number}}",
        hideHint: "הסתר רמז",
        showHint: "הצג רמז",
        showSolution: "הצג פתרון",
        correct: "נכון!",
        incorrect: "לא נכון, נסה שוב",
        adaptivePractice: "תרגול מותאם אישית",
        probabilityInputFormat: "הכנס הסתברות כמספר עשרוני (לדוגמה: 0.25)",
        equationInputFormat: "הכנס את תשובתך בפורמט: x=ערך, y=ערך",
        probabilityPlaceholder: "לדוגמה: 0.25",
        equationPlaceholder: "לדוגמה: x=5, y=3",
        errorGettingQuestion: "שגיאה בקבלת שאלה חדשה",
        messages: {
          correct: "נכון!",
          incorrect: "לא נכון, נסה שוב",
          enterAnswer: "אנא הכנס תשובה",
          invalidTopic: "נושא לא תקין",
          questionExpired: "השאלה פגה תוקף, מקבל שאלה חדשה",
          topicMismatch: "אי התאמה בנושא, מקבל שאלה חדשה",
          errorCheckingAnswer: "שגיאה בבדיקת התשובה"
        },
       
        rewards: {
          streak: "רצף של {{count}} שאלות! +{{points}} נקודות",
          difficultyIncrease: "רמת הקושי עלתה! +{{points}} נקודות"
        },
        questions: {
          title: "שאלה",
          description: "תיאור",
          equation: "משוואה",
          answer: "תשובה",
          steps: "שלבי פתרון",
          finalAnswer: "תשובה סופית",
          loading: "טוען שאלה...",
          error: "שגיאה בטעינת השאלה",
          retry: "נסה שוב",
          skip: "דלג על השאלה",
          submit: "שלח תשובה",
          next: "שאלה הבאה",
          previous: "שאלה קודמת",
          progress: "שאלה {{current}} מתוך {{total}}",
          timeRemaining: "זמן נותר: {{time}}",
          expired: "הזמן נגמר",
          solution: "פתרון",
          yourAnswer: "התשובה שלך"
        }
      },
      levels: {
        title: "רמות מתמטיקה",
        description: "צפה ברמת המתמטיקה הכללית שלך ורמות הנושאים השונים",
        overallMathLevel: "רמת מתמטיקה כללית",
        topicLevels: "רמות לפי נושא",
        back: "חזרה ללוח הבקרה",
        studentLevels: "רמות מתמטיקה של {{name}}"
      },
      createAssignment: {
        title: "צור משימה",
        description: "צור משימה חדשה לתלמידים שלך",
        details: "פרטי המשימה",
        detailsDesc: "הגדר את הגדרות המשימה ופרמטרים של למידה מסתגלת",
        selectTopic: "בחר נושא",
        assignmentTitle: "כותרת המשימה",
        assignmentType: "סוג המשימה",
        individual: "אישי",
        class: "כיתה",
        selectStudent: "בחר תלמיד",
        selectStudentPlaceholder: "בחר תלמיד",
        selectClass: "בחר כיתה",
        selectClassPlaceholder: "בחר כיתה",
        dueDate: "תאריך הגשה",
        dueDatePlaceholder: "dd/mm/yyyy --:-- --",
        generateQuestions: "צור שאלות",
        create: "צור משימה",
        cancel: "בטל",
        preview: "תצוגה מקדימה",
        topics: {
          equations: "מערכת משוואות",
          trigonometry: "טריגונומטריה",
          vectors: "וקטורים",
          complex: "מספרים מרוכבים",
          calculus: "חשבון דיפרנציאלי",
          sequences: "סדרות",
          geometry: "גאומטריה אנליטית",
          probability: "הסתברות וסטטיסטיקה"
        }
      },
      errors: {
        fetchAssignments: "שגיאה בטעינת המשימות",
        fetchClasses: "שגיאה בטעינת הכיתות",
        createClass: "שגיאה ביצירת כיתה",
        deleteClass: "שגיאה במחיקת כיתה",
        classNameRequired: "נדרש שם כיתה"
      },
      success: {
        classCreated: "הכיתה נוצרה בהצלחה",
        classDeleted: "הכיתה נמחקה בהצלחה"
      },
      confirmations: {
        deleteClass: "האם אתה בטוח שברצונך למחוק את הכיתה?"
      },
      back: "חזור",
      dateNotAvailable: "תאריך לא זמין",
      loading: "טוען...",
      completed: "הושלם",
      pending: "ממתין",
      navigation: {
        practice: "תרגול",
        dashboard: "לוח בקרה",
        assignments: "משימות",
        students: "תלמידים",
        classes: "כיתות",
        logout: "התנתק"
      },
      smallScreen: {
        practice: "תרגול",
        dashboard: "לוח בקרה",
        assignments: "משימות",
        students: "תלמידים",
        classes: "כיתות",
        logout: "התנתק"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 