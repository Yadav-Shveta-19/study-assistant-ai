import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8787', timeout: 45_000 });
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export async function generateStudyMaterial(input, signal) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try { return (await api.post('/api/study', { input }, { signal })).data; }
    catch (error) {
      lastError = error;
      if (signal?.aborted || error.code === 'ERR_CANCELED') throw error;
      const status = error.response?.status;
      if (![408, 429, 502, 503, 504].includes(status) || attempt === 2) throw error;
      await wait((attempt + 1) * 1200);
    }
  }
  throw lastError;
}
