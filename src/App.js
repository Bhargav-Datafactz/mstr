import React, { useEffect, useState } from "react";
import { authenticateMSTR, createMSTRReportInstance, getMSTRReportData } from "./mstrService";
 
const REPORT_ID = "87B8DBD94BAE4412F5D9D0B2D1D2A968"; // Replace with your actual report ID
 
const App = () => {
  const [reportData, setReportData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
 
  useEffect(() => {
    const fetchReport = async () => {
      await authenticateMSTR(); // Authenticate and start session
      const instanceId = await createMSTRReportInstance(REPORT_ID);
      console.log("Instance ID returned:", instanceId);
      
      if (instanceId) {
        const data = await getMSTRReportData(REPORT_ID, instanceId);
        console.log("Report data:", data);
        setReportData(data);
 
        // Extract headers and row data
const headerNames = data.result.definition.columns.map(col => col.name);
const rowData = data.result.data.root.map(row => row.map(cell => cell.formatted));
console.log("Report data:", data);        
        setHeaders(headerNames);
        setRows(rowData);
      }
    };
 
    fetchReport();
  }, []);
 
  return (
    <div>
      <h2>📊 MicroStrategy Embedded Report</h2>
      {reportData ? (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
{headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
{rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
{row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
};
 
export default App;