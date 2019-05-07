import axios from "axios";

const api = axios.create({
  baseURL: "https://kosherwithoutborders.com/wp-json/wp/v2"
});

export default api;
