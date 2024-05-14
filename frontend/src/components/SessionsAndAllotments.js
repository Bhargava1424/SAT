import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, format, isMonday, nextMonday, isSameDay } from 'date-fns';

const SessionAndAllotments = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedMonday, setSelectedMonday] = useState(null);

  // Function to fetch all teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      const response = await fetch('http://localhost:5000/teachers');
      const data = await response.json();
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
    <div className="w-full mt-8">
      <Navbar />
      <h2 className="text-2xl font-bold mb-2 text-center">Session & Allotments</h2>
      <div className="text-center mb-4">
        <DatePicker
          selected={selectedMonday}
          onChange={handleDateChange}
          dateFormat="MMMM d, yyyy"
          placeholderText="Select a Monday"
          filterDate={date => isMonday(date)}
          className="px-4 py-2 bg-white border border-gray-400 rounded cursor-pointer"
        />
      </div>
      <div className="overflow-auto max-h-screen p-4">
        <table className="table-auto bg-white border-collapse border border-gray-500 mx-auto">
          <thead className="bg-[#2D5990] text-white">
            <tr>
              <th className="px-4 py-2 text-center border-b border-gray-600 border-r">Session</th>
              <th className="px-4 py-2 text-center border-b border-gray-600 border-r" colSpan={teachers.length}>
                Teachers
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-center border-b border-gray-600 border-r"></th>
              {teachers.map((teacher) => (
                <th key={teacher._id} className="px-4 py-2 text-center border-b border-gray-600 border-r">
                  {teacher.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, index) => (
              <tr
                key={index}
                className={`${
                  isCurrentDate(session) ? 'bg-blue-200 pointer-events-none' : 'even:bg-gray-200 hover:bg-gray-400'
                }`}
              >
                <td className="px-4 py-2 border-b border-gray-600 border-r text-center">{session}</td>
                {teachers.map((teacher) => (
                  <td key={teacher._id} className="px-4 py-2 border-b border-gray-600 border-r text-center">
                    {teacher.name}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SessionAndAllotments;