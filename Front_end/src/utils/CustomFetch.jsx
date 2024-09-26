import axios from "axios";
const CustomFetch = axios.create({
  baseURL: "http://localhost:3000/api/v1/Landmarks",
});
export default CustomFetch;
