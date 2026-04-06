// src/api/api.js
const BASE_URL = '/api'; // URL из твоего swagger.yaml

export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
});

export default BASE_URL;