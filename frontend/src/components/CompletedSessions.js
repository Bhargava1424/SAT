import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import profileImage from '../assets/profile.jpg';

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
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/sessions/teacher/${teacherName}`);
        setTeacherSessions(response.data);

        const session = response.data.find(session => new Date(session.startDate) <= sessionDate);
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
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/students/completedStudents/${currentSession._id}`);
          const completedStudents = response.data

          // Check if the student.photo is google drive link
        // if data is not null, then check if the photo is google drive link
        if (completedStudents !== null) {
          completedStudents.forEach(student => {
            if (student.photo && student.photo.includes('drive')) {
              try{
                const linkId = student.photo.split('/d/')[1].split('/view')[0];
                student.photo = `https://drive.google.com/thumbnail?id=${linkId}`;
              } catch (error) {
                student.photo = "";
              }
            }
          });
        }

          setCompletedStudents(completedStudents);
        }
      } catch (error) {
        console.error('Error fetching students', error);
      }
    };

    fetchCompletedStudents();
  }, [currentSession]);

  const handleViewEdit = async (name, sessionId, applicationNumber) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/assessments/${applicationNumber}/${sessionId}`);
      const assessment = response.data;
      navigate(`/assessment/${name}/${sessionId}/${applicationNumber}/${assessment._id}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        navigate(`/assessment/${name}/${sessionId}/${applicationNumber}`);
      } else {
        console.error('Error fetching assessment', error);
      }
    }
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
                  src={student.photo || profileImage}
                  alt={student.firstName}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg md:text-xl font-bold text-[#2D5990] mb-1">{student.firstName} {student.surName}</h2>
                <button
                  onClick={() => handleViewEdit(student.firstName, currentSession._id, student.applicationNumber)}
                  className="w-full content-end bg-gradient-to-r from-[#2D5990] to-[#00A0E3] hover:from-[#00A0E3] hover:to-[#2D5990] text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors duration-300 transform hover:scale-105"
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
