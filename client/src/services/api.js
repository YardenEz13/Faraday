// client/src/services/api.js
import axios from "axios";

const API_URL = "http://localhost:4000/api";

// Add token to all requests if it exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const getStudentDashboard = () => {
  return axios.get(`${API_URL}/dashboard/student`);
};

export const getTeacherDashboard = () => {
  return axios.get(`${API_URL}/dashboard/teacher`);
};
export const sendAssignmentToStudent = (studentId, assignmentData) => {
  return axios.post(`${API_URL}/assignments/send`, {
    studentId,
    ...assignmentData
  });
};
  

export const getUnassignedStudents = () => {
  return axios.get(`${API_URL}/user/unassigned-students`);
};

export const assignStudent = (studentId) => {
  return axios.post(`${API_URL}/user/assign-student/${studentId}`);
};

export const generateAssignmentWithAI = (prompt) => {
  return axios.post(`${API_URL}/assignments/generate`, { prompt });
};

export const getStudentAssignments = () => {
  return axios.get(`${API_URL}/assignments/student-assignments`);
};

export const getAssignment = (assignmentId) => {
  return axios.get(`${API_URL}/assignments/assignment/${assignmentId}`);
};

export const submitAssignmentAnswer = async (assignmentId, answer) => {
  const response = await axios.post(`${API_URL}/assignments/submit-answer/${assignmentId}`, { answer });
  return response; // This will include response.data with isCorrect, message, and newLevel
};

export const getTeacherAssignments = () => {
  return axios.get(`${API_URL}/assignments/teacher-assignments`);
};

export const getStudentStatistics = () => {
  return axios.get(`${API_URL}/user/student-statistics`);
};

export const deleteAssignment = (assignmentId) => {
  return axios.delete(`${API_URL}/assignments/assignment/${assignmentId}`);
};

export const getAssignmentHint = async (assignmentId) => {
  const response = await axios.get(`${API_URL}/assignments/hint/${assignmentId}`);
  return response;
};

export const surrenderAssignment = async (assignmentId) => {
  const response = await axios.post(`${API_URL}/assignments/surrender/${assignmentId}`);
  return response;
};

export const getNextQuestion = (topic) => {
  return axios.get(`${API_URL}/practice/${topic}/question`);
};

export const submitPracticeAnswer = (topic, questionId, answer, hintsUsed) => {
  return axios.post(`${API_URL}/practice/${topic}/submit`, {
    questionId,
    answer,
    hintsUsed
  });
};

// ניתן להוסיף עוד פונקציות לפי הצורך
