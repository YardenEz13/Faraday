// Default to localhost if environment variable is not set
export const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000/api'
  : process.env.REACT_APP_API_URL || '/api'; 