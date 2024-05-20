import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Navbar from './Navbar';

const AddAttendance = () => {
  const [message, setMessage] = useState('');
  const [payload, setPayload] = useState(null);

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
      const requiredHeaders = ['Application Number', 'Student Name', 'FN/Total', 'AN/Total'];

      // Validate headers
      for (let header of requiredHeaders) {
        if (!headers.includes(header)) {
          alert('Excel file has missing fields, please check.');
          return;
        }
      }

      // Prepare the payload
      const dataPayload = jsonData.slice(1).map(row => ({
        applicationNumber: row[0],
        studentName: row[1],
        fnTotal: row[2],
        anTotal: row[3]
      }));

      console.log(dataPayload);
      setPayload(dataPayload);
      setMessage('File successfully processed and payload prepared.');
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="add-attendance">
      <Navbar />
      <div className='container mx-auto px-4 bg-gray-400 rounded-3xl min-h-screen'>
        <h2 className="text-xl md:text-2xl font-bold m-2 mb-4 text-center">Add Attendance</h2>
        <div className="text-center my-2 text-xl">
          <p>Welcome! Please upload an Excel file to add attendance records.</p>
          <p>Ensure the Excel file follows the format below:</p>
          <table className='mx-auto border-collapse border border-gray-800 text-xs'>
            <thead>
              <tr className='bg-gray-200'>
                <th className='border border-gray-800 px-2 py-1'>Application Number</th>
                <th className='border border-gray-800 px-2 py-1'>Student Name</th>
                <th className='border border-gray-800 px-2 py-1'>FN/Total</th>
                <th className='border border-gray-800 px-2 py-1'>AN/Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900001</td>
                <td className='border border-gray-800 px-2 py-1'>Ramesh</td>
                <td className='border border-gray-800 px-2 py-1'>5/6</td>
                <td className='border border-gray-800 px-2 py-1'>5/6</td>
              </tr>
              <tr className='bg-gray-100'>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900002</td>
                <td className='border border-gray-800 px-2 py-1'>Suresh</td>
                <td className='border border-gray-800 px-2 py-1'>4/6</td>
                <td className='border border-gray-800 px-2 py-1'>3/6</td>
              </tr>
              <tr>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900003</td>
                <td className='border border-gray-800 px-2 py-1'>Rahul</td>
                <td className='border border-gray-800 px-2 py-1'>5/6</td>
                <td className='border border-gray-800 px-2 py-1'>5/6</td>
              </tr>
              <tr className='bg-gray-100'>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900004</td>
                <td className='border border-gray-800 px-2 py-1'>Shreya</td>
                <td className='border border-gray-800 px-2 py-1'>2/6</td>
                <td className='border border-gray-800 px-2 py-1'>2/6</td>
              </tr>
              <tr>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900005</td>
                <td className='border border-gray-800 px-2 py-1'>Aryan</td>
                <td className='border border-gray-800 px-2 py-1'>4/6</td>
                <td className='border border-gray-800 px-2 py-1'>4/6</td>
              </tr>
              <tr className='bg-gray-100'>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900006</td>
                <td className='border border-gray-800 px-2 py-1'>Vikram</td>
                <td className='border border-gray-800 px-2 py-1'>6/6</td>
                <td className='border border-gray-800 px-2 py-1'>3/6</td>
              </tr>
              <tr>
                <td className='border border-gray-800 px-2 py-1'>KPL2024900007</td>
                <td className='border border-gray-800 px-2 py-1'>Shastri</td>
                <td className='border border-gray-800 px-2 py-1'>6/6</td>
                <td className='border border-gray-800 px-2 py-1'>6/6</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='text-center my-4'>
          <p className="mb-2 font-bold">Upload here:</p>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            onChange={handleFileUpload} 
            className="px-4 py-2 bg-[#00A0E3] text-white rounded cursor-pointer"
          />
        </div>
        {message && <p className="text-center mt-4 text-green-500">{message}</p>}
        {payload && <pre className="bg-gray-200 p-4 mt-4 rounded">{JSON.stringify(payload, null, 2)}</pre>}
      </div>
    </div>
  );
};

export default AddAttendance;
