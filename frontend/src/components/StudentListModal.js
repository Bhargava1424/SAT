// src/components/StudentListModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentListModal = ({ isOpen, onClose, clusterID, sessionID }) => {
  const [students, setStudents] = useState([]);

  console.log(clusterID, String(sessionID));
  const sessionId = String(sessionID);
  console.log(sessionId);

  useEffect(() => {
    if (clusterID) {
      const fetchStudents = async () => {
        try {
          const response = await axios.get(process.env.REACT_APP_BASE_URL + `/students/cluster/${clusterID}/session/${sessionId}`);
          setStudents(response.data);
        } catch (error) {
          console.error('Error fetching students', error);
        }
      };

      fetchStudents();
    }
  }, [clusterID, sessionID]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full transform transition-transform duration-300 ease-in-out scale-95">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700 transition-colors duration-300 ease-in-out">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center text-[#2D5990]">Students in Cluster {clusterID}</h2>
        <ul className="divide-y divide-gray-300">
          {students.map((student) => (
            <li key={student._id} className="py-2 flex justify-between items-center hover:bg-gray-100 transition-colors duration-300 ease-in-out">
              <span>{student.firstName} {student.surName}</span>
              <button className="text-[#2D5990] hover:text-[#00A0E3] transition-colors duration-300 ease-in-out">
                View Details
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentListModal;
