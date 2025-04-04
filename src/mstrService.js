import axios from "axios";
const BASE_URL = "http://10.1.51.211:8080/MicroStrategyLibrary/api";
// Base API configuration with iSession cookies enabled
const MSTR_API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Enables iSession cookie for authentication
  httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false })
});
 
// 1️⃣ Authenticate and Start Session

export const authenticateMSTR = async () => {
    try {
        console.log("🔄 Attempting authentication...");

        const authResponse = await MSTR_API.post(
            `/auth/login`,
            {
                username: "administrator",
                password: "",
                loginMode: 1
            },
            {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"  // Prevents redirects
                },
                maxRedirects: 0, // 🚨 Prevents automatic redirects
                validateStatus: (status) => status < 400 // Allow non-2xx responses
            }
        );

       // console.log("📢 Full Login Response:", authResponse);
        console.log("📢 Full Login Response:", authResponse);
        console.log("🔄 Response Headers:", authResponse.headers);
        console.log("🔄 Response Data:", authResponse.data);

        // ✅ Extract Auth Token from headers or cookies
        let authToken = authResponse.headers["x-mstr-authtoken"];
        if (!authToken) {
            const cookies = document.cookie;
            authToken = cookies.match(/iSession=([^;]+)/)?.[1];  // ✅ Extract from cookies
        }

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
  

 
// 2️⃣ Create a Report Instance
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
                    "X-MSTR-AuthToken": authToken,  // ✅ Pass the Auth Token
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
}

  
  

  
 
// 3️⃣ Fetch Report Data
export const getMSTRReportData = async (REPORT_ID, instanceId) => {
  try {
    const response = await MSTR_API.get(`/reports/${REPORT_ID}/instances/${instanceId}`);
return response.data; // Return report data
  } catch (error) {
    console.error("❌ Error fetching report data:", error.response?.data || error.message);
  }
};