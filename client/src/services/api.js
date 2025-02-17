// client/src/services/api.js
import axios from "axios";

const API_URL = 'http://localhost:4000/api';

const handleApiError = (error) => {
  console.error('API Error:', error.response?.data || error.message);
  if (error.response?.status === 401) {
    // Handle unauthorized access
    window.location.href = '/login';
  }
  throw error;
};

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

// Add response interceptor for error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401 errors
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common["Authorization"];
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const { email, password } = credentials;
    
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await axios.post(`${API_URL}/auth/login`, {
      email: email.toLowerCase().trim(),
      password: password.trim()
    });

    const { data } = response;
    
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getUnassignedStudents = async (params) => {
  try {
    const queryString = params ? `?${params.toString()}` : '';
    const response = await axios.get(`${API_URL}/user/unassigned-students${queryString}`);
    if (!response.data) {
      throw new Error('Invalid response format for unassigned students');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const assignStudent = async (studentId, classId = null) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    // If classId is provided, add student to class
    if (classId) {
      const response = await axios.post(`${API_URL}/classes/add-student`, {
        studentId,
        classId
      });
      return response.data;
    }
    
    // If no classId, assign student to teacher
    const response = await axios.post(`${API_URL}/user/assign-student`, {
      studentId
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const generateAssignmentWithAI = async (prompt) => {
  try {
    const response = await axios.post(`${API_URL}/assignments/generate`, { prompt });
    if (!response.data) {
      throw new Error('Empty response from AI service');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getStudentAssignments = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/student`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }
    const response = await axios.get(`${API_URL}/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Helper function to check answers
const checkAnswer = (userAnswer, correctAnswer) => {
  try {
    console.log('Checking answer:', { userAnswer, correctAnswer });
    
    // Normalize the user answer by removing extra spaces and standardizing format
    const normalizedUserAnswer = userAnswer.replace(/\s+/g, '').toLowerCase();
    
    // Parse the user answer string into x and y values - now handles multiple formats
    const userMatch = normalizedUserAnswer.match(/x=([^,\s]+)[,\s]*y=([^,\s]+)/i);
    if (!userMatch) {
      console.log('Invalid answer format');
      return false;
    }
    
    const [, userX, userY] = userMatch;
    
    // Convert to numbers for comparison
    const userXNum = parseFloat(userX);
    const userYNum = parseFloat(userY);
    
    // Get correct values - handle both string and number formats
    const correctX = parseFloat(correctAnswer.x);
    const correctY = parseFloat(correctAnswer.y);
    
    if (isNaN(userXNum) || isNaN(userYNum) || isNaN(correctX) || isNaN(correctY)) {
      console.log('Invalid number conversion');
      return false;
    }
    
    const tolerance = 0.01;
    const isXCorrect = Math.abs(userXNum - correctX) <= tolerance;
    const isYCorrect = Math.abs(userYNum - correctY) <= tolerance;
    
    console.log('Comparison:', {
      userX: userXNum,
      userY: userYNum,
      correctX,
      correctY,
      isXCorrect,
      isYCorrect
    });
    
    return isXCorrect && isYCorrect;
  } catch (error) {
    console.error('Error checking answer:', error);
    return false;
  }
};

export const submitAssignmentAnswer = async (assignmentId, answer) => {
  try {
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }
    if (!answer) {
      throw new Error('Answer is required');
    }
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/answer`, { answer });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTeacherAssignments = async () => {
  try {
    const response = await axios.get(`${API_URL}/assignments/teacher`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getStudents = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/my-students`);
    if (!response.data) {
      throw new Error('Invalid response format for students');
    }
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await axios.delete(`${API_URL}/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAssignmentHint = async (assignmentId) => {
  try {
    const response = await axios.get(`${API_URL}/assignments/${assignmentId}/hint`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const surrenderAssignment = async (assignmentId) => {
  try {
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/surrender`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPracticeQuestion = async (topic, options = {}) => {
  try {
    if (!topic) {
      throw new Error('Topic is required');
    }
    const response = await axios.get(`${API_URL}/practice/${topic}`, { params: options });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const submitPracticeAnswer = async ({ topic, answer }) => {
  try {
    if (!topic) {
      throw new Error('Topic is required');
    }
    const response = await axios.post(`${API_URL}/practice/${topic}/answer`, {
      topic,
      answer: answer.toString().trim()
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAssignmentQuestion = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }
    const response = await axios.get(`${API_URL}/assignments/${assignmentId}/question`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createAssignment = async (assignmentData) => {
  try {
    if (!assignmentData.title || !assignmentData.topic || !assignmentData.dueDate || !assignmentData.classId || !assignmentData.teacherId) {
      const missingFields = [];
      if (!assignmentData.title) missingFields.push('title');
      if (!assignmentData.topic) missingFields.push('topic');
      if (!assignmentData.dueDate) missingFields.push('dueDate');
      if (!assignmentData.classId) missingFields.push('classId');
      if (!assignmentData.teacherId) missingFields.push('teacherId');
      
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Format the data
    const formattedData = {
      ...assignmentData,
      questions: assignmentData.questions.map(q => ({
        ...q,
        solution: JSON.stringify(q.solution) // Convert solution object to string
      })),
      title: {
        he: assignmentData.title.he || '',
        en: assignmentData.title.en || ''
      },
      student: null, // This will be set by the server for each student in the class
      type: 'class' // Explicitly set type as class assignment
    };

    console.log('API URL being used:', API_URL);
    console.log('Token:', localStorage.getItem('token'));
    console.log('Sending assignment data to server:', JSON.stringify(formattedData, null, 2));

    const response = await axios.post(`${API_URL}/assignments`, formattedData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed error information:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    handleApiError(error);
    throw error;
  }
};

export const getStudentDashboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/student`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getStudentDetails = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/student/${studentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTeacherDashboard = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/teacher`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const sendAssignmentToStudent = async (studentId, assignment) => {
  try {
    if (!studentId || !assignment) {
      throw new Error('Student ID and assignment are required');
    }

    if (!assignment.title || !assignment.description || !assignment.equation || !assignment.dueDate) {
      const missingFields = [];
      if (!assignment.title) missingFields.push('title');
      if (!assignment.description) missingFields.push('description');
      if (!assignment.equation) missingFields.push('equation');
      if (!assignment.dueDate) missingFields.push('dueDate');
      
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Format the solution
    const formattedSolution = {
      steps: assignment.solution?.steps || [],
      answer: assignment.solution?.final_answers ? 
        `x=${assignment.solution.final_answers.x}, y=${assignment.solution.final_answers.y}` : '',
      final_answers: assignment.solution?.final_answers || { x: '', y: '' }
    };

    // Format the assignment data
    const formattedAssignment = {
      studentId: studentId,
      title: assignment.title.trim(),
      description: assignment.description.trim(),
      equation: assignment.equation.trim(),
      solution: formattedSolution,
      hints: Array.isArray(assignment.hints) ? assignment.hints : [],
      dueDate: assignment.dueDate
    };

    const response = await axios.post(`${API_URL}/assignments/send`, formattedAssignment);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create a new adaptive assignment
export const createAdaptiveAssignment = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/assignments/adaptive`, data, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating adaptive assignment:', error);
    throw error;
  }
};

export const submitAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error('Assignment ID is required');
    }
    const response = await axios.post(`${API_URL}/assignments/${assignmentId}/submit`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/classes`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    const response = await axios.post(`${API_URL}/classes`, classData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteClass = async (classId) => {
  try {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    const response = await axios.delete(`${API_URL}/classes/${classId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};