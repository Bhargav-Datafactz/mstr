import axios from "axios";
// Use relative URL since we're using proxy
const BASE_URL = "http://10.1.51.211:8080/MicroStrategyLibrary/api";
// Base API configuration with iSession cookies enabled
const MSTR_API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true // Enables iSession cookie for authentication
});
 
// 1️⃣ Authenticate and Start Session

export const authenticateMSTR = async () => {
    try {
        console.log("🔄 Attempting authentication...");

        // First, try to get the login page to handle any redirects
        await MSTR_API.get('http://10.1.51.211:8080/auth/login', {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

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
                    "X-Requested-With": "XMLHttpRequest"
                },
                maxRedirects: 5, // Allow redirects but limit them
                validateStatus: (status) => status < 400
            }
        );

        // Check if we got redirected
        if (authResponse.request?.responseURL && authResponse.request.responseURL !== `${BASE_URL}/auth/login`) {
            console.log("🔄 Detected redirect to:", authResponse.request.responseURL);
            // Update the base URL to the redirected URL
            MSTR_API.defaults.baseURL = authResponse.request.responseURL.replace('/auth/login', '');
        }

        console.log("📢 Full Login Response:", authResponse);
        console.log("🔄 Response Headers:", authResponse.headers);
        console.log("🔄 Response Data:", authResponse.data);

        // ✅ Extract Auth Token from headers or cookies
        let authToken = authResponse.headers["x-mstr-authtoken"];
        if (!authToken) {
            const cookies = document.cookie;
            authToken = cookies.match(/iSession=([^;]+)/)?.[1];
        }

        if (!authToken) {
            console.error("❌ Authentication failed: No Auth Token found!");
            return null;
        }

        console.log("✅ Auth Token received:", authToken);
        return authToken;
        
    } catch (error) {
        console.error("❌ Error during API call:", error.response ? error.response.data : error.message);
        if (error.response?.status === 302) {
            console.log("🔄 Handling redirect...");
            // Try to follow the redirect
            const redirectUrl = error.response.headers.location;
            if (redirectUrl) {
                MSTR_API.defaults.baseURL = redirectUrl.replace('/auth/login', '');
                return authenticateMSTR(); // Retry authentication with new URL
            }
        }
        return null;
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