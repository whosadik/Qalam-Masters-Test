import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
});

let isRefreshing = false;
let waiters = [];

const getAccess = () => localStorage.getItem("qm_access") || "";
const getRefresh = () => localStorage.getItem("qm_refresh") || "";
const setAccess = (t) => localStorage.setItem("qm_access", t);
const setPair = ({ access, refresh }) => {
  if (access) localStorage.setItem("qm_access", access);
  if (refresh) localStorage.setItem("qm_refresh", refresh);
};
const clearPair = () => {
  localStorage.removeItem("qm_access");
  localStorage.removeItem("qm_refresh");
};

api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    if (!error.response) throw error;

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        await new Promise((res) => waiters.push(res));
        original.headers.Authorization = `Bearer ${getAccess()}`;
        return api(original);
      }

      isRefreshing = true;
      try {
        const refresh = getRefresh();
        if (!refresh) throw error;

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/token/refresh/`,
          { refresh }
        );
        if (data?.access) setAccess(data.access);

        waiters.forEach((w) => w());
        waiters = [];

        original.headers.Authorization = `Bearer ${getAccess()}`;
        return api(original);
      } catch (e) {
        clearPair();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export { api, setPair, clearPair, getAccess, getRefresh };
