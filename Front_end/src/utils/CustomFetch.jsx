import axios from "axios";
const CustomFetch = axios.create({
  baseURL: "http://localhost:8000",
});
export default CustomFetch;
