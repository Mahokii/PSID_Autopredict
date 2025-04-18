import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', 
});

export const predictPrice = async (formData) => {
  try {
    const response = await api.post('/api/predict_price', formData);
    return response.data;
  } catch (error) {
    console.error('Error predicting price:', error);
    throw error;
  }
};

export default api;