import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, isMonday, nextMonday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

const SessionAndAllotments = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedMonday, setSelectedMonday] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [hoveredCluster, setHoveredCluster] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await fetch('http://localhost:5000/teachers');
      const data = await response.json();
      const filteredTeachers = data.filter(teacher => teacher.role === 'teacher');
      setTeachers(filteredTeachers);
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetch('http://localhost:5000/sessions');
      const data = await response.json();
      setSessions(data);
    };
    fetchSessions();
  }, [selectedMonday]);

  useEffect(() => {
    const fetchClusters = async () => {
      const response = await fetch('http://localhost:5000/clusters');
      const data = await response.json();
      setClusters(data);
    };
    fetchClusters();
  }, []);

  const handleDateChange = (date) => {
    if (isMonday(date)) {
      setSelectedMonday(date);
    } else {
      setSelectedMonday(nextMonday(date));
    }
  };

  const generateSessions = (startDate, numberOfSessions) => {
    const sessions = [];
    for (let i = 0; i < numberOfSessions; i++) {
      const start = addDays(startDate, i * 14);
      const end = addDays(start, 13);
      sessions.push(`${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`);
    }
    return sessions;
  };

  const filteredSessions = selectedMonday ? generateSessions(selectedMonday, 8) : [];

  const isCurrentDate = (sessionPeriod) => {
    const today = new Date();
    const [startDateStr, endDateStr] = sessionPeriod.split(' - ');
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return isSameDay(today, startDate) || (today > startDate && today <= endDate);
  };

  const getTeacherName = (teacherID) => {
    const teacher = teachers.find(t => t.teacherID === teacherID);
    return teacher ? teacher.name : teacherID;
  };

  const getClusterInfo = (clusterID) => {
    const cluster = clusters.find(c => c.clusterID === clusterID);
    return cluster ? { setA: cluster.setA.join(', '), setB: cluster.setB.join(', ') } : { setA: '', setB: '' };
  };

  const handleMouseEnter = (clusterID, cellID) => {
    const clusterInfo = getClusterInfo(clusterID);
    setHoveredCluster(clusterInfo);
    setHoveredCell(cellID);
  };

  const handleMouseLeave = () => {
    setHoveredCluster(null);
    setHoveredCell(null);
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto py- px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-[#2D5990] animate-pulse">SESSIONS & ALLOTMENTS</h2>
        <div className="text-center my-6">
          <DatePicker
            selected={selectedMonday}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select a Monday"
            filterDate={date => isMonday(date)}
            className="px-6 py-3 text-lg bg-white border-2 border-[#2D5990] rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-[#2D5990] transition duration-300 ease-in-out"
          />
        </div>
        <div className="overflow-visible max-h-screen rounded-3xl shadow-2xl bg-white border-4 border-[#2D5990]">
          <table className="table-auto w-full bg-white border-collapse">
            <thead className="bg-gradient-to-r from-[#2D5990] to-[#00A0E3] text-white">
              <tr>
                <th className="px-6 py-2 text-center border-b-4 border-white text-lg md:text-base font-bold">Session</th>
                <th className="px-6 py-2 text-center border-b-4 border-white text-lg md:text-base font-bold" colSpan={teachers.length}>
                  Teachers
                </th>
              </tr>
              <tr>
                <th className="px-6 text-center border-b-4 border-white"></th>
                {teachers.map((teacher) => (
                  <th key={teacher._id} className="px-6 py-2 text-center border-b-4 border-white text-lg md:text-base font-semibold">
                    {teacher.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((sessionPeriod, index) => {
                const session = sessions.find(s => s.period === sessionPeriod);
                const currentDateClass = isCurrentDate(sessionPeriod) ? 'bg-gradient-to-r from-[#00A0E3] to-[#2D5990] text-white' : '';
                return (
                  <motion.tr
                    key={index}
                    className={`even:bg-gray-100 hover:bg-gray-200 ${currentDateClass}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 border-b-2 border-gray-200 text-center text-lg md:text-base font-semibold">{sessionPeriod}</td>
                    {session ? session.teachers.map((teacher, idx) => (
                      <td
                        key={idx}
                        className={`relative px-4 py-2 border-b-2 border-gray-200 text-center text-lg md:text-base font-medium`}
                        onMouseEnter={() => handleMouseEnter(teacher.clusterID, `${index}-${idx}`)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div
                          className={`py-2 border-b-2 border-gray-200 text-center text-lg md:text-base font-medium ${
                            teacher.status === 'complete' ? 'bg-green-600 text-white' :
                            teacher.status === 'incomplete' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                          } rounded-3xl opacity-95 shadow-md transition duration-300 ease-in-out hover:scale-105`}
                        >
                          {getTeacherName(teacher.teacherID)}
                        </div>
                        {hoveredCell === `${index}-${idx}` && hoveredCluster && (
                          <div className="absolute min-w-fit bottom-full mb-2 w-full bg-gray-800 text-white text-lg md:text-base font-medium p-4 rounded-2xl shadow-2xl border-4 border-[#2D5990] animate-fade-in flex justify-between">
                            <div className="mr-4">
                              <strong>Set A:</strong> {hoveredCluster.setA}
                            </div>
                            <div>
                              <strong>Set B:</strong> {hoveredCluster.setB}
                            </div>
                          </div>
                        )}
                      </td>
                    )) : <td colSpan={teachers.length} className="px-6 py-4 border-b-2 border-gray-200 text-center text-lg md:text-base font-medium">No data</td>}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionAndAllotments;
