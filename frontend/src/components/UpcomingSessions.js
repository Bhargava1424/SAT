  import React, { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Navbar from './Navbar';
  import axios from 'axios';
  import profileImage from '../assets/profile.jpg';

  const UpcomingSessions = () => {
    const navigate = useNavigate();
    const [hoveredStudent, setHoveredStudent] = useState(null);
    const [upcomingStudents, setUpcomingStudents] = useState([]);

    useEffect(() => {
      const fetchUpcomingStudents = async () => {
        try {
          const teacherName = sessionStorage.getItem('name');
          const response = await axios.get(`http://localhost:5000/students/upcomingStudents/${teacherName}`);
          setUpcomingStudents(response.data);
        } catch (error) {
          console.error('Error fetching upcoming students', error);
        }
      };

      fetchUpcomingStudents();
    }, []);

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
            Upcoming Assessment Sessions
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {upcomingStudents.map(student => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onMouseEnter={() => handleMouseEnter(student)}
                onMouseLeave={handleMouseLeave}
              >
                <div>
                  <img
                    src={student.photo || profileImage} 
                    alt={student.firstName}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg md:text-xl font-bold text-[#2D5990] mb-1">{student.firstName} {student.surName}</h2>
                  <p className="text-sm md:text-base text-gray-600 bg-gray-100 rounded-lg p-2">
                    This student will be listed in the Pending sessions in the upcoming session.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  export default UpcomingSessions;