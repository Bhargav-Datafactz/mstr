import axios from "axios";
 
// Base API configuration with iSession cookies enabled
const MSTR_API = axios.create({
baseURL: "/MicroStrategyLibrary/api",
  withCredentials: true, // Enables iSession cookie for authentication
});
 
// 1️⃣ Authenticate and Start Session
export const authenticateMSTR = async () => {
    try {
      const response = await MSTR_API.post("/auth/login", {
        username: "administrator",
        password: "",
      });
  
      // Extract the Auth Token
      const authToken = response.headers["x-mstr-authtoken"];
      console.log("✅ Authentication successful. Auth Token:", authToken);
  
      return authToken; // Return the token for use in other requests
    } catch (error) {
      console.error("❌ Authentication Failed:", error.response?.data || error.message);
    }
  };
  
 
// 2️⃣ Create a Report Instance (Required Before Fetching Data)
export const createMSTRReportInstance = async (REPORT_ID) => {
    try {
      const authToken = await authenticateMSTR(); // Get the Auth Token
  
      const response = await MSTR_API.post(
        `/reports/${REPORT_ID}/instances`,
        {},
        {
          headers: {
            "X-MSTR-ProjectID": "95550C99497DAAC3AC19DD86D91C4BB3",
            "X-MSTR-AuthToken": authToken,  // 👈 Pass the Auth Token
            "Accept": "application/json",
          }
        }
      );
  
      console.log("📢 Full Response from Create Instance API:", response);
  
      // Ensure we got a valid JSON response
      if (typeof response.data === "object" && response.data.instanceId) {
        console.log("✅ Report instance created. ID:", response.data.instanceId);
        return response.data.instanceId;
      } else {
        console.error("❌ Unexpected Response (Not JSON)", response.data);
      }
    } catch (error) {
      console.error("❌ Error creating report instance:", error.response?.data || error.message);
    }
  };
  
  

  
 
// 3️⃣ Fetch Report Data
export const getMSTRReportData = async (REPORT_ID, instanceId) => {
  try {
    const response = await MSTR_API.get(`/reports/${REPORT_ID}/instances/${instanceId}`);
return response.data; // Return report data
  } catch (error) {
    console.error("❌ Error fetching report data:", error.response?.data || error.message);
  }
};