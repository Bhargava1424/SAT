// src/components/StudentListModal.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentListModal = ({ isOpen, onClose, clusterID, sessionID }) => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (clusterID) {
      const fetchStudents = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/students/cluster/${clusterID}/session/${sessionID}`);
          setStudents(response.data);
        } catch (error) {
          console.error('Error fetching students', error);
        }
      };

      fetchStudents();
    }
  }, [clusterID]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-4 rounded-lg max-w-lg w-full">
        <button onClick={onClose} className="float-right text-gray-500">X</button>
        <h2 className="text-2xl font-bold mb-4">Students in Cluster {clusterID}</h2>
        <ul>
          {students.map((student) => (
            <li key={student._id} className="border-b py-2">
              {student.firstName} {student.surName}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentListModal;
