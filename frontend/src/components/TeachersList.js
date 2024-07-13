import React, { useState, useMemo } from 'react';

const TeachersList = ({ teachers, onRowClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

  const rowsPerPage = 20;

  const filteredTeachers = useMemo(() => {
    const queries = searchQuery.toLowerCase().split(',').map(q => q.trim());
    return teachers.filter(teacher => {
      return queries.every(query =>
        `${teacher.name},${teacher.email},${teacher.role},${teacher.phoneNumber},${teacher.branch},${teacher.teacherID},${teacher.subject}`
          .toLowerCase()
          .includes(query)
      );
    });
  }, [searchQuery, teachers]);

  const sortedTeachers = useMemo(() => {
    if (sortConfig.key === '') return filteredTeachers;

    const sorted = [...filteredTeachers].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTeachers, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTeachers = sortedTeachers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedTeachers.length / rowsPerPage);

  return (
    <div className="w-full md:w-3/4 mt-4 md:mt-8 bg-white rounded-3xl shadow-lg p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-center text-[#2D5990]">Users List</h2>
      <input
        type="text"
        placeholder="Search by name, email, role, phoneNumber, branch, teacherID (separate by commas)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="input input-bordered w-full bg-white text-black my-1 md:my-2 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-blue-500 mb-4"
      />
      <div className="overflow-x-auto">
        <table className="w-full table-auto bg-white border-collapse border border-gray-500 mx-2 mb-4 rounded-lg shadow">
          <thead className="bg-[#2D5990] text-white">
            <tr>
              <th onClick={() => handleSort('teacherID')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Teacher ID</th>
              <th onClick={() => handleSort('name')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Name</th>
              <th onClick={() => handleSort('role')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Role</th>
              <th onClick={() => handleSort('subject')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Subject</th>
              <th onClick={() => handleSort('email')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Email</th>
              <th onClick={() => handleSort('phoneNumber')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Phone Number</th>
              <th onClick={() => handleSort('branch')} className="px-2 md:px-4 py-2 text-center border-b border-gray-600 border-r text-sm md:text-base cursor-pointer">Branch</th>
              <th className="px-2 md:px-4 py-2 text-center border-b border-gray-600 text-sm md:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTeachers.map((teacher) => (
              <tr
                key={teacher._id}
                className={`cursor-pointer even:bg-gray-200 hover:bg-gray-400 transition-all duration-300`}
                onClick={() => onRowClick(teacher)}
              >
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.teacherID}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.name}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.role}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.subject}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.email}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.phoneNumber}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 border-r text-sm md:text-base">{teacher.branch}</td>
                <td className="px-2 md:px-4 py-1 md:py-2 border-b border-gray-600 text-sm md:text-base">
                  <button className="bg-[#2D5990] text-white px-2 py-1 rounded-md">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="btn btn-primary bg-[#2D5990] text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm md:text-base">Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="btn btn-primary bg-[#2D5990] text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TeachersList;
