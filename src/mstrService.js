import axios from "axios";
 
// Base API configuration with iSession cookies enabled
const MSTR_API = axios.create({
baseURL: "http://10.1.51.211:8080/MicroStrategyLibrary/api",
  withCredentials: true, // Enables iSession cookie for authentication
});
 
// 1️⃣ Authenticate and Start Session
export const authenticateMSTR = async () => {
    try {
      const response = await MSTR_API.post(
        "/auth/login",
        { username: "administrator", password: "" },
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("📢 Full Login Response:", response);
  
      // Extract AuthToken correctly
      const authToken = response.headers["x-mstr-authtoken"] || response.headers["X-MSTR-AuthToken"];
      console.log("📢 Response Headers:", response.headers);
      console.log("📢 Response Data:", response.data);
  
      if (!authToken) {
        console.error("❌ Auth Token is missing! Possible login failure.");
      } else {
        console.log("✅ Authentication successful. Auth Token:", authToken);
      }
  
      return authToken;
    } catch (error) {
      console.error("❌ Authentication Failed:", error.response?.data || error.message);
    }


  };
  
  
 
// 2️⃣ Create a Report Instance (Required Before Fetching Data)
export const createMSTRReportInstance = async (REPORT_ID) => {
    try {
      const authToken = await authenticateMSTR(); // Ensure token is retrieved
  
      if (!authToken) {
        console.error("⚠️ Cannot create instance without Auth Token.");
        return;
      }
  
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
  
      if (typeof response.data === "object" && response.data.instanceId) {
        console.log("✅ Report instance created. ID:", response.data.instanceId);
        return response.data.instanceId;
      } else {
        console.error("❌ Unexpected Response (Not JSON). Check authentication & API path.", response.data);
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