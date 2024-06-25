import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';


// Dummy data for students
const students = [
  { id: 1, name: 'Alice Johnson', imageUrl: '/profileicon.jpeg'},
  { id: 2, name: 'Bob Smith', imageUrl: '/profileicon.jpeg'},
  { id: 3, name: 'Charlie Brown', imageUrl: '/profileicon.jpeg'},
  { id: 4, name: 'Diana Prince', imageUrl: '/profileicon.jpeg'},
  { id: 5, name: 'Edward King', imageUrl: '/profileicon.jpeg'},
  { id: 6, name: 'Fiona Shrek', imageUrl: '/profileicon.jpeg'},
  { id: 7, name: 'George Washington', imageUrl: '/profileicon.jpeg'},
  { id: 8, name: 'Hannah Montana', imageUrl: '/profileicon.jpeg'},
  { id: 9, name: 'Ian Curtis', imageUrl: '/profileicon.jpeg'},
  { id: 10, name: 'Jessica Jones', imageUrl: '/profileicon.jpeg'},
  { id: 11, name: 'Kyle Reese', imageUrl: '/profileicon.jpeg'},
  { id: 12, name: 'Laura Palmer', imageUrl: '/profileicon.jpeg'},
  { id: 13, name: 'Michael Scott', imageUrl: '/profileicon.jpeg'},
  { id: 14, name: 'Nancy Drew', imageUrl: '/profileicon.jpeg'},
  { id: 15, name: 'Oliver Queen', imageUrl: '/profileicon.jpeg' }
  // Add more students as needed
];

const PendingStudents = () => {
  const navigate = useNavigate();
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  
  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        const teacherName = sessionStorage.getItem('name')
        const response = await axios.get(`http://localhost:5000/students/pendingStudents/${teacherName}`);
        console.log(response.data);
        setPendingStudents(response.data);
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };
  
    fetchPendingStudents();
  }, []);

  const handleAssessNow = (name) => {
    navigate(`/assessment/${name}`);
  };

  const handleMouseEnter = (student) => {
    setHoveredStudent(student);
  };

  const handleMouseLeave = () => {
    setHoveredStudent(null);
  };

  return (
    <div>
      <Navbar />
      <div className="container py-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-32 bg-gradient-to-br from-blue-100 to-blue-200 mx-auto my-6 rounded-3xl shadow-lg">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center text-[#2D5990] flex items-center justify-center">
          Pending Assessment Students
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {students.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              onMouseEnter={() => handleMouseEnter(student)}
              onMouseLeave={handleMouseLeave}
            >
              <div>
                <img
                  src={student.imageUrl}
                  alt={student.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-bold text-[#2D5990] mb-1">{student.name}</h2>
                <button
                  onClick={() => handleAssessNow(student.name)}
                  className="w-full bg-gradient-to-r from-[#2D5990] to-[#00A0E3] hover:from-[#00A0E3] hover:to-[#2D5990] text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-300 transform hover:scale-105"
                >
                  Assess Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingStudents;