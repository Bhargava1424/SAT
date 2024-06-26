import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CompletedSessions = () => {
  const navigate = useNavigate();
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [completedStudents, setCompletedStudents] = useState([]);
  const [teacherSessions, setTeacherSessions] = useState([]);
  const [sessionDate, setSessionDate] = useState(new Date());
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const getTeacherSessions = async () => {
      try {
        const teacherName = sessionStorage.getItem('name');
        // Fetch the session information for the teacher
        const getTeacherSessionsResponse = await axios.get(`http://localhost:5000/sessions/teacher/${teacherName}`);
        setTeacherSessions(getTeacherSessionsResponse.data);

        // Find the session that matches the sessionDate (using the start date)
        const session = getTeacherSessionsResponse.data.find(session => 
          new Date(session.startDate) <= sessionDate
        );

        setCurrentSession(session);

      } catch (error) {
        console.error('Error fetching sessions', error);
      }
    };

    getTeacherSessions();
  }, [sessionDate]);

  useEffect(() => {
    const fetchCompletedStudents = async () => {
      try {
        if (currentSession) {
          const completedStudentsResponse = await axios.get(`http://localhost:5000/students/completedStudents/${currentSession._id}`);
          const completedStudentsData = completedStudentsResponse.data;
          setCompletedStudents(completedStudentsData);
        }
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };

    fetchCompletedStudents();
  }, [currentSession]);

  const handleViewEdit = (name, sessionId, applicationNumber) => {
    navigate(`/assessment/${name}/${sessionId}/${applicationNumber}`);
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
          Completed Assessment Sessions
        </h1>
        <div className="flex justify-center mb-8">
          <DatePicker
            selected={sessionDate}
            onChange={date => setSessionDate(date)}
            dateFormat="yyyy/MM/dd"
            className="px-4 py-2 border rounded-md bg-white"
          />
        </div>
        {currentSession && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#2D5990]">Current Session Details</h2>
            <p><strong>Session ID:</strong> {currentSession._id}</p>
            <p><strong>Cluster ID:</strong> {currentSession.clusterID}</p>
            <p><strong>Start Date:</strong> {new Date(currentSession.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(currentSession.sessionEndDate).toLocaleDateString()}</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {completedStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              onMouseEnter={() => handleMouseEnter(student)}
              onMouseLeave={handleMouseLeave}
            >
              <div>
                <img
                  src={student.photo || 'default-image-url'} 
                  alt={student.firstName}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-bold text-[#2D5990] mb-1">{student.firstName} {student.surName}</h2> 
                <button
                  onClick={() => handleViewEdit(student.firstName, currentSession._id, student.applicationNumber)}
                  className="w-full bg-gradient-to-r from-[#2D5990] to-[#00A0E3] hover:from-[#00A0E3] hover:to-[#2D5990] text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-300 transform hover:scale-105"
                >
                  View or Edit Assessment
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompletedSessions;