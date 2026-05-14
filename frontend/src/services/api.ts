import axios from 'axios';

// Create an axios instance with basic configuration for API calls
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Placeholder URL for Phase 1 - replace with real backend later
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;