import React, { useState } from 'react';
import Navbar from './Navbar';

// Dummy data for students
const students = [
  { id: 1, name: 'Alice Johnson', imageUrl: '/profileicon.jpeg' },
  { id: 2, name: 'Bob Smith', imageUrl: '/profileicon.jpeg' },
  { id: 3, name: 'Charlie Brown', imageUrl: '/profileicon.jpeg' },
  { id: 4, name: 'Diana Prince', imageUrl: '/profileicon.jpeg' },
  { id: 5, name: 'Edward King', imageUrl: '/profileicon.jpeg' },
  { id: 6, name: 'Fiona Shrek', imageUrl: '/profileicon.jpeg' },
  { id: 7, name: 'Alice Johnson', imageUrl: '/profileicon.jpeg' },
  { id: 8, name: 'Bob Smith', imageUrl: '/profileicon.jpeg' },
  { id: 9, name: 'Charlie Brown', imageUrl: '/profileicon.jpeg' },
  { id: 10, name: 'Diana Prince', imageUrl: '/profileicon.jpeg' },
  { id: 11, name: 'Edward King', imageUrl: '/profileicon.jpeg' },
  { id: 12, name: 'Fiona Shrek', imageUrl: '/profileicon.jpeg' },
  // Add more students as needed
];

const UpcomingSessions = () => {
  const [hoveredStudent, setHoveredStudent] = useState(null);

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
                  <p className="text-sm md:text-base text-gray-600 bg-gray-100 rounded-lg p-2">
                    Next week, this student will be listed in the Pending sessions.
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