import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const user = localStorage.getItem("kura_user");
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

export default api;

// Auth
export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);
export const registerCandidate = (data) => api.post("/auth/register/candidate", data);

// Admin
export const getAdminStats = () => api.get("/admin/stats");
export const uploadCandidatePhoto = (formData) =>
  api.post("/admin/upload-photo", formData, { headers: { "Content-Type": "multipart/form-data" } });

// Elections
export const getElections = () => api.get("/elections");
export const getElection = (id) => api.get(`/elections/${id}`);

// Voters
export const getVoterProfile = () => api.get("/voter/profile");
