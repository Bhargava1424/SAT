import React from 'react';
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
  return (
    <div>
        <Navbar/>
        <div className="container mx-auto px-4 bg-gray-400 rounded-3xl">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {students.map(student => (
            <div key={student.id} className="h-46 md:h-72 bg-white shadow-md rounded-lg p-4 m-2">
                <img src={student.imageUrl} alt={student.name} className="rounded-full w-20 md:w-28 md:h-28 mx-auto"/>
                <h1 className='text-center text-xs md:text-lg'>{student.name}</h1>
                <p className='text-justify bg-gray-300 rounded-2xl p-1 md:p-2 text-xs md:text-sm'>Next week, this student will be listed in the Pending sessions.</p>
            </div>
            ))}
        </div>
        </div>
    </div>
  );
};

export default UpcomingSessions;
