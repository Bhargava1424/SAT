import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, isMonday, nextMonday, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';

const SessionAndAllotments = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedMonday, setSelectedMonday] = useState(null);

  // Function to fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await fetch('http://localhost:5000/teachers');
      const data = await response.json();
      console.log("User data:", data);
      const filteredTeachers = data.filter(teacher => teacher.role === 'teacher');
      setTeachers(filteredTeachers);
    };
    fetchTeachers();
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

  const sessions = selectedMonday ? generateSessions(selectedMonday, 8) : [];

  const isCurrentDate = (sessionDate) => {
    const today = new Date();
    const [startDateStr, endDateStr] = sessionDate.split(' - ');
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return isSameDay(today, startDate) || (today > startDate && today <= endDate);
  };

  return (
    <div className="w-full bg-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-[#2D5990]">SESSIONS & ALLOTMENTS</h2>
        <div className="text-center my-4">
          <DatePicker
            selected={selectedMonday}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select a Monday"
            filterDate={date => isMonday(date)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D5990]"
          />
        </div>
        <div className="overflow-auto max-h-screen rounded-lg shadow-lg">
          <table className="table-auto w-full bg-white border-collapse">
            <thead className="bg-[#2D5990] text-white">
              <tr>
                <th className="px-4 py-3 text-center border-b border-gray-200 text-sm md:text-base">Session</th>
                <th className="px-4 py-3 text-center border-b border-gray-200 text-sm md:text-base" colSpan={teachers.length}>
                  Teachers
                </th>
              </tr>
              <tr>
                <th className="px-4 py-3 text-center border-b border-gray-200"></th>
                {teachers.map((teacher) => (
                  <th key={teacher._id} className="px-4 py-3 text-center border-b border-gray-200 text-sm md:text-base">
                    {teacher.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, index) => (
                <motion.tr
                  key={index}
                  className={`${
                    isCurrentDate(session) ? 'bg-[#00A0E3] pointer-events-none' : 'even:bg-gray-100 hover:bg-gray-200'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="px-4 py-3 border-b border-gray-200 text-center text-sm md:text-base">{session}</td>
                  {teachers.map((teacher) => (
                    <td key={teacher._id} className="px-4 py-3 border-b border-gray-200 text-center text-sm md:text-base">
                      {teacher.name}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionAndAllotments;