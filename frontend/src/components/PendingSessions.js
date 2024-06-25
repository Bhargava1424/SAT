import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

const PendingStudents = () => {
  const navigate = useNavigate();
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]); 
  const [teacherSessions, setTeacherSessions] = useState([]);

  useEffect(() => {
    const getTeacherSessions = async () => {
      try {
        const teacherName = sessionStorage.getItem('name');
        console.log(teacherName);
        // Fetch the session information for the teacher
        const getTeacherSessionsResponse = await axios.get(`http://localhost:5000/sessions/teacher/${teacherName}`);
        console.log(getTeacherSessionsResponse.data);
        setTeacherSessions(getTeacherSessionsResponse.data)
        
      } catch (error) {
        console.error('Error fetching sessions', error);
      }
    };

    getTeacherSessions();
  }, []);

  useEffect(() => {
    const fetchPendingStudents = async () => {
      try {
        const sessionId = "66796de39ce14002d7f63bed"
        // Fetch the session information for the teacher
        const pendingStudentsResponse = await axios.get(`http://localhost:5000/students/pendingStudents/${sessionId}`);
        const pendingStudentsData = pendingStudentsResponse.data;
        setPendingStudents(pendingStudentsData)
        
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };

    fetchPendingStudents();
  }, []);

  const handleAssessNow = (name, sessionId) => {
    navigate(`/assessment/${name}/${sessionId}`);
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
          {pendingStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              onMouseEnter={() => handleMouseEnter(student)}
              onMouseLeave={handleMouseLeave}
            >
              <div>
                <img
                  src={student.photo || 'default-image-url'} // Replace 'default-image-url' with a valid URL or a default image URL
                  alt={student.firstName}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-bold text-[#2D5990] mb-1">{student.firstName} {student.surName}</h2>
                <button
                  onClick={() => handleAssessNow(student.firstName, "66796de39ce14002d7f63bed")}
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
