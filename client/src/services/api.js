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
    console.error('Registration error:', error.response?.data || error);
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
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

export const getStudentDashboard = () => {
  return axios.get(`${API_URL}/dashboard/student`);
};

export const getTeacherDashboard = () => {
  return axios.get(`${API_URL}/dashboard/teacher`);
};

export const sendAssignmentToStudent = (studentId, assignment) => {
  console.log('API Service: Starting to send assignment');
  console.log('API Service: Input data:', {
    studentId,
    assignment
  });

  if (!studentId || !assignment) {
    console.error('API Service: Missing studentId or assignment');
    throw new Error('Student ID and assignment are required');
  }

  // Log all fields to check what might be missing
  console.log('API Service: Checking required fields:', {
    hasStudentId: !!studentId,
    hasTitle: !!assignment.title,
    hasDescription: !!assignment.description,
    hasEquation: !!assignment.equation,
    hasDueDate: !!assignment.dueDate,
    hasSolution: !!assignment.solution,
    title: assignment.title,
    description: assignment.description,
    equation: assignment.equation,
    dueDate: assignment.dueDate,
    solution: assignment.solution
  });

  if (!assignment.title || !assignment.description || !assignment.equation || !assignment.dueDate) {
    const missingFields = [];
    if (!assignment.title) missingFields.push('title');
    if (!assignment.description) missingFields.push('description');
    if (!assignment.equation) missingFields.push('equation');
    if (!assignment.dueDate) missingFields.push('dueDate');
    
    console.error('API Service: Missing required fields:', missingFields);
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Format the solution
  const formattedSolution = {
    steps: assignment.solution?.steps || [],
    answer: assignment.solution?.final_answers ? 
      `x=${assignment.solution.final_answers.x}, y=${assignment.solution.final_answers.y}` : '',
    final_answers: assignment.solution?.final_answers || { x: '', y: '' }
  };

  // Format the assignment data according to the server's expectations
  const formattedAssignment = {
    studentId: studentId,
    title: assignment.title.trim(),
    description: assignment.description.trim(),
    equation: assignment.equation.trim(),
    solution: formattedSolution,
    hints: Array.isArray(assignment.hints) ? assignment.hints : [],
    dueDate: assignment.dueDate
  };

  // Log the final formatted data being sent
  console.log('API Service: Sending formatted assignment:', {
    url: `${API_URL}/assignments/send`,
    data: formattedAssignment
  });

  return axios.post(`${API_URL}/assignments/send`, formattedAssignment)
    .then(response => {
      console.log('API Service: Server response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('API Service: Server error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};

export const getUnassignedStudents = async () => {
  try {
    console.log('Fetching unassigned students...');
    const response = await axios.get(`${API_URL}/user/unassigned-students`);
    console.log('Unassigned students response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching unassigned students:', error.response?.data || error.message);
    throw error;
  }
};

export const assignStudent = async (studentId) => {
  try {
    console.log('Assigning student:', studentId);
    const response = await axios.post(`${API_URL}/user/assign-student/${studentId}`);
    console.log('Assign student response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error assigning student:', error.response?.data || error.message);
    throw error;
  }
};

export const generateAssignmentWithAI = (prompt) => {
  return axios.post(`${API_URL}/assignments/generate`, { prompt });
};

export const getStudentAssignments = () => {
  return axios.get(`${API_URL}/dashboard/student`);
};

export const getAssignment = (assignmentId) => {
  return axios.get(`${API_URL}/assignments/${assignmentId}`);
};

export const submitAssignmentAnswer = (assignmentId, answer) => {
  console.log('Submitting answer:', { assignmentId, answer });
  
  // The answer is already formatted as a string "x=value, y=value"
  const formattedAnswer = {
    answer: answer
  };

  console.log('Formatted answer being sent:', formattedAnswer);
  
  return axios.post(`${API_URL}/assignments/${assignmentId}/submit`, formattedAnswer)
    .then(response => {
      console.log('Server response:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error submitting answer:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    });
};

export const getTeacherAssignments = () => {
  return axios.get(`${API_URL}/assignments/teacher`);
};

export const getStudents = () => {
  return axios.get(`${API_URL}/dashboard/teacher`);
};

export const deleteAssignment = async (assignmentId) => {
  return await axios.delete(`${API_URL}/assignments/${assignmentId}`);
};

export const getAssignmentHint = async (assignmentId) => {
  return await axios.get(`${API_URL}/assignments/${assignmentId}/hint`);
};

export const surrenderAssignment = async (assignmentId) => {
  return await axios.post(`${API_URL}/assignments/${assignmentId}/surrender`);
};
