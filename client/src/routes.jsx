import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AssignmentPage from "./pages/AssignmentPage";
import AssignmentCreatePage from "./pages/AssignmentCreatePage";
import StudentAssignmentsPage from "./pages/StudentAssignmentsPage";
import StudentsPage from "./pages/StudentsPage";
import PracticePage from "./pages/PracticePage";
import AdaptivePracticePage from "./pages/AdaptivePracticePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./providers/auth";
import ClassesPage from "./pages/ClassesPage";
import LevelsPage from "./pages/LevelsPage";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? (
          <Navigate to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} />
        ) : (
          <LoginPage />
        )
      } />
      
      <Route path="/register" element={
        user ? (
          <Navigate to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} />
        ) : (
          <RegisterPage />
        )
      } />

      <Route path="/dashboard/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard/teacher" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />

      <Route path="/students" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <StudentsPage />
        </ProtectedRoute>
      } />

      <Route path="/assignments" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentAssignmentsPage />
        </ProtectedRoute>
      } />

      <Route path="/assignment/create" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AssignmentCreatePage />
        </ProtectedRoute>
      } />

      <Route path="/assignment/create/:studentId" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <AssignmentCreatePage />
        </ProtectedRoute>
      } />

      <Route path="/assignment/:id" element={
        <ProtectedRoute allowedRoles={['student', 'teacher']}>
          <AssignmentPage />
        </ProtectedRoute>
      } />

      <Route path="/practice" element={
        <ProtectedRoute allowedRoles={['student']}>
          <PracticePage />
        </ProtectedRoute>
      } />

      <Route path="/practice/:topicId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <AdaptivePracticePage />
        </ProtectedRoute>
      } />

      <Route path="/classes" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <ClassesPage />
        </ProtectedRoute>
      } />

      <Route path="/levels" element={
        <ProtectedRoute allowedRoles={['student','teacher']}>
          <LevelsPage />
        </ProtectedRoute>
      } />

      <Route path="/levels/:studentId" element={
        <ProtectedRoute allowedRoles={['teacher']}>
          <LevelsPage />
        </ProtectedRoute>
      } />

      <Route path="/" element={
        user ? (
          <Navigate to={user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} />
        ) : (
          <Navigate to="/login" />
        )
      } />

      <Route path="*" element={
        <Navigate to={user ? (user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student') : '/login'} />
      } />
    </Routes>
  );
}

export default AppRoutes; 