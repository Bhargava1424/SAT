import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Navbar from './Navbar';

const AddAttendance = () => {
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState({ show: false, type: '', text: '' });
  const [payload, setPayload] = useState(null);
  const [applicationNumbers, setApplicationNumbers] = useState([]);
  const [studentNames, setStudentNames] = useState([]);
  const userBranch = sessionStorage.getItem('branch');

  useEffect(() => {
    // Fetch application numbers for the user's branch
    const fetchApplicationNumbers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/students/applicationNumbers/${userBranch}`);
        const data = await response.json();
        setApplicationNumbers(data);
      } catch (error) {
        console.error('Error fetching application numbers:', error);
        setMessage('Error fetching application numbers');
      }
    };

    fetchApplicationNumbers();
  }, [userBranch]);

  useEffect(() => {
    // Fetch student names for the user's branch
    const fetchStudentNames = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/students/studentNames/${userBranch}`);
        const data = await response.json();
        setStudentNames(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching student names:', error);
        setMessage('Error fetching student names');
      }
    };

    fetchStudentNames();
  }, [userBranch]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const headers = jsonData[0];
      const requiredHeaders = ['Application Number', 'Student Name', 'FN/Total', 'AN/Total', 'Exams'];

      // Validate headers
      for (let header of requiredHeaders) {
        if (!headers.includes(header)) {
          alert('Excel file has missing fields, please check.');
          return;
        }
      }

      // Prepare the payload
      const dataPayload = jsonData.slice(1).map(row => ({
        applicationNumber: String(row[0]), // Ensure application number is treated as a string
        studentName: row[1],
        fnTotal: String(row[2]), // Ensure these fields are treated as strings
        anTotal: String(row[3]),
        exams: String(row[4])
      }));

      console.log(dataPayload);
      setPayload(dataPayload);
      setMessage('File successfully processed and payload prepared.');
    };

    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!payload) {
      setMessage('No data to upload');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/students/updateAttendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred while uploading data');
      }

      setNotification({ show: true, type: 'success', text: data.message || 'Attendance updated successfully' });
      setTimeout(() => setNotification({ show: false, type: '', text: '' }), 3000); // Hide after 3 seconds
    } catch (error) {
      setNotification({ show: true, type: 'error', text: 'Error uploading attendance data: ' + error.message });
      console.error(error);
      setTimeout(() => setNotification({ show: false, type: '', text: '' }), 3000); // Hide after 3 seconds
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ['Application Number', 'Student Name', 'FN/Total', 'AN/Total', 'Exams'],
      ...applicationNumbers.map((num, index) => [
        num,
        studentNames[index] ? `${studentNames[index].firstName} ${studentNames[index].surName}` : '', // Combine firstName and surName
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'AttendanceTemplate.xlsx');
  };

  return (
    <div className="add-attendance min-h-screen bg-gray-400">
      <Navbar />
      <div className="container mx-auto px-4 py-6 bg-gray-300 shadow-lg rounded-3xl mt-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#2D5990]">Add Attendance</h2>
        <div className="flex justify-end mr-10">
          <button 
            onClick={downloadTemplate} 
            className="px-6 py-3 bg-[#00A0E3] text-white rounded-lg hover:bg-[rgb(44,154,202)] transition duration-200"
          >
            Download Excel Template
          </button>
        </div>
        
        <div className="text-center my-4 text-lg text-gray-700">
          <p>Welcome! Please upload an Excel file to add attendance records.</p>
          <p>Ensure the Excel file follows the format below:</p>
          <div className="overflow-x-auto my-4">
            <table className="mx-auto border-collapse border border-gray-400 text-sm shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#2D5990] text-white">
                  <th className="border border-gray-400 px-4 py-2">Application Number</th>
                  <th className="border border-gray-400 px-4 py-2">Student Name</th>
                  <th className="border border-gray-400 px-4 py-2">FN/Total</th>
                  <th className="border border-gray-400 px-4 py-2">AN/Total</th>
                  <th className="border border-gray-400 px-4 py-2">Exams</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border border-gray-400 px-4 py-2">Application Number 1</td>
                  <td className="border border-gray-400 px-4 py-2">Name 1</td>
                  <td className="border border-gray-400 px-4 py-2">5/6</td>
                  <td className="border border-gray-400 px-4 py-2">5/6</td>
                  <td className="border border-gray-400 px-4 py-2">1/2</td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="border border-gray-400 px-4 py-2">Application Number 2</td>
                  <td className="border border-gray-400 px-4 py-2">Name 2</td>
                  <td className="border border-gray-400 px-4 py-2">4/6</td>
                  <td className="border border-gray-400 px-4 py-2">3/6</td>
                  <td className="border border-gray-400 px-4 py-2">2/2</td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-gray-400 px-4 py-2">Application Number 3</td>
                  <td className="border border-gray-400 px-4 py-2">Name 3</td>
                  <td className="border border-gray-400 px-4 py-2">5/6</td>
                  <td className="border border-gray-400 px-4 py-2">5/6</td>
                  <td className="border border-gray-400 px-4 py-2">1/2</td>
                </tr>
                <tr className="bg-gray-200">
                  <td className="border border-gray-400 px-4 py-2 font-bold">. . . .</td>
                  <td className="border border-gray-400 px-4 py-2 font-bold">. . . .</td>
                  <td className="border border-gray-400 px-4 py-2 font-bold">. . . .</td>
                  <td className="border border-gray-400 px-4 py-2 font-bold">. . . .</td>
                  <td className="border border-gray-400 px-4 py-2 font-bold">. . . .</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center my-6">
          <p className="mb-4 font-bold text-[#2D5990]">Upload here:</p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            className="px-4 py-2 bg-[#00A0E3] text-white rounded cursor-pointer hover:bg-[#008ac2] transition duration-200"
          />
        </div>
        {message && <p className="text-center mt-4 text-green-500 font-semibold">{message}</p>}
        {payload && (
          <div className="text-center my-6">
            <button 
              onClick={handleUpload} 
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
            >
              Upload Attendance Data
            </button>
          </div>
        )}
        {notification.show && (
          <div className="fixed top-6 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300 bg-opacity-90">
            <div className={`rounded-lg p-2 ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {notification.text}
            </div>
            <div className="bg-gray-300 mt-2 w-full h-1">
              <div
                className="bg-gray-600 h-1"
                style={{ animation: 'progress 3s linear forwards' }}
              ></div>
            </div>
          </div>
        )}

        <style>
        {`
        @keyframes progress {
          0% { width: 100%; }
          100% { width: 0; }
        }
        `}
        </style>
      </div>
    </div>
  );
};

export default AddAttendance;
