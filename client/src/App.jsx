import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import PracticePage from "./pages/PracticePage";
import StudentsTable from "./pages/StudentsTable";
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import RegisterPage from "./pages/RegisterPage";
import AssignmentPage from "./pages/AssignmentPage";
import './index.css'
import { ThemeProvider } from "./context/theme-provider";
import StudentsTablePage from "./pages/StudentsTablePage";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext";
import PracticeTopicPage from "./pages/PracticeTopicPage";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard/student" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/teacher" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentsTable />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/assignment/:id" 
            element={
              <ProtectedRoute allowedRoles={['student', 'teacher']}>
                <AssignmentPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/students-table" 
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <StudentsTablePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/addition" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="addition" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/multiplication" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="multiplication" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/pythagorean" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="pythagorean" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/linear" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="linear" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/fractions" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="fractions" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/practice/word-problems" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PracticeTopicPage topic="word-problems" />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
