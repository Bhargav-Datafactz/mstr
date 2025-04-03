import axios from "axios";
 
// Base API configuration with iSession cookies enabled
const MSTR_API = axios.create({
baseURL: "/MicroStrategyLibrary/api",
  withCredentials: true, // Enables iSession cookie for authentication
});
 
// 1️⃣ Authenticate and Start Session

export const authenticateMSTR = async () => {
    try {
        console.log("🔄 Attempting authentication...");

        const authResponse = await axios.post(
            "auth/login",
            {
                username: "administrator",
                password: "your_password",
                loginMode: 1
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true 
            }
        );

        console.log("📢 Full Login Response:", authResponse);

        // Extract Auth Token Correctly
        let authToken = authResponse.headers["x-mstr-authtoken"] || authResponse.data.iSession;

        if (!authToken) {
            console.error("❌ Authentication failed: No Auth Token found!");
            return null;
        }

        console.log("✅ Auth Token received:", authToken);
        return authToken;  // 🔥 Ensure token is returned!
        
    } catch (error) {
        console.error("❌ Error during API call:", error.response ? error.response.data : error.message);
        return null;  // 🔥 Return null on failure!
    }
};

  
  
 
// 2️⃣ Create a Report Instance (Required Before Fetching Data)
export const createMSTRReportInstance = async (REPORT_ID) => {
    try {
        const authToken = await authenticateMSTR(); // Ensure token is retrieved

        if (!authToken) {
            console.error("⚠️ Cannot create instance without Auth Token.");
            return null;
        }

        const response = await MSTR_API.post(
            `/reports/${REPORT_ID}/instances`,
            {},
            {
                headers: {
                    "X-MSTR-ProjectID": "95550C99497DAAC3AC19DD86D91C4BB3",
                    "X-MSTR-AuthToken": authToken,  // Pass the Auth Token
                    "Accept": "application/json",
                }
            }
        );

        console.log("📢 Full Response from Create Instance API:", response);

        if (response.data?.instanceId) {
            console.log("✅ Report instance created. ID:", response.data.instanceId);
            return response.data.instanceId;
        } else {
            console.error("❌ Unexpected Response. Check authentication & API path.", response.data);
            return null;
        }
    } catch (error) {
        console.error("❌ Error creating report instance:", error.response?.data || error.message);
        return null;
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