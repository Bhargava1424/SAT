import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import UploadModal from './UploadModal';

const UpdateStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const handleUploadClick = (student) => {
    setCurrentStudent(student);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRowClick = (id) => {
    if (selectedRow === id) {
      setSelectedRow(null);
    } else {
      setSelectedRow(id);
    }
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/students');
      const data = await response.json();
      if (response.ok) {
        setStudents(data);
      } else {
        throw new Error(data.error || 'An error occurred while fetching data');
      }
    } catch (error) {
      setError('Error fetching students: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const filteredStudents = students.filter((student) => {
    const searchTerms = searchQuery.toLowerCase().split(',').map((term) => term.trim());
    const studentValues = Object.values(student).map((value) => value.toString().toLowerCase());

    return searchTerms.every((term) => studentValues.some((value) => value.includes(term)));
  });

  // Sorting functionality
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedStudents = filteredStudents.sort((a, b) => {
    if (sortColumn) {
      const valueA = a[sortColumn].toString().toLowerCase();
      const valueB = b[sortColumn].toString().toLowerCase();

      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  const getPageButtons = () => {
    const buttons = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`px-4 py-2 mr-2 ${
              currentPage === i ? 'bg-[#2D5990] text-white' : 'bg-gray-200 hover:bg-gray-400'
            } rounded-full transition-all duration-300`}
          >
            {i}
          </button>
        );
      }
    } else {
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`px-4 py-2 mr-2 ${
            currentPage === 1 ? 'bg-[#2D5990] text-white' : 'bg-gray-200 hover:bg-gray-400'
          } rounded-full transition-all duration-300`}
        >
          1
        </button>
      );

      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1" className="px-4 py-2 mr-2">...</span>);
      }

      if (currentPage > 2) {
        buttons.push(
          <button
            key={currentPage - 1}
            onClick={() => paginate(currentPage - 1)}
            className="px-4 py-2 mr-2 bg-gray-200 hover:bg-gray-400 rounded-full transition-all duration-300"
          >
            {currentPage - 1}
          </button>
        );
      }

      if (currentPage !== 1 && currentPage !== totalPages) {
        buttons.push(
          <button
            key={currentPage}
            onClick={() => paginate(currentPage)}
            className="px-4 py-2 mr-2 bg-[#2D5990] text-white rounded-full transition-all duration-300"
          >
            {currentPage}
          </button>
        );
      }

      if (currentPage < totalPages - 1) {
        buttons.push(
          <button
            key={currentPage + 1}
            onClick={() => paginate(currentPage + 1)}
            className="px-4 py-2 mr-2 bg-gray-200 hover:bg-gray-400 rounded-full transition-all duration-300"
          >
            {currentPage + 1}
          </button>
        );
      }

      if (currentPage < totalPages - 2) {
        buttons.push(<span key="ellipsis2" className="px-4 py-2 mr-2">...</span>);
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`px-4 py-2 mr-2 ${
            currentPage === totalPages ? 'bg-[#2D5990] text-white' : 'bg-gray-200 hover:bg-gray-400'
          } rounded-full transition-all duration-300`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  const handleLinkSubmitted = (link) => {
    // Update the student in the database with the new link
    fetch(process.env.REACT_APP_BASE_URL + `/students/${currentStudent._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleDriveLink: link }),
    })
      .then(response => {
        if (response.ok) {
          // You might want to refresh the student data here
          fetchStudents();
          closeModal();
        } else {
          // Handle the error
          console.error('Error updating student:', response.status);
        }
      })
      .catch(error => console.error('Error updating student:', error));
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        <h2 className="text-center text-white text-xl font-semibold">Loading...</h2>
        <p className="w-1/3 text-center text-white">This may take a few seconds, please don't close this page.</p>
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl m-1 md:mx-6 shadow-lg">
        <div className="px-4 py-6 md:px-32">
          <div className="relative flex flex-col md:flex-row items-center justify-between mb-1 md:mb-4 space-y-2 md:space-y-0">
            <div className="flex-none w-full md:w-auto">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full md:w-auto px-4 py-1 md:py-2 bg-white border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              />
            </div>

            <div className="w-full md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:w-auto">
              <h2 className="text-md md:text-2xl font-bold text-center md:text-left text-[#2D5990]">UPDATE STUDENT</h2>
            </div>

            <div className="flex-none w-full md:w-auto">
              <div className="flex justify-center md:inline-flex md:text-base text-xs">{getPageButtons()}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white border-collapse border border-gray-500">
              <thead className="bg-[#2D5990] text-white">
                <tr>
                  <th
                    className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base"
                    onClick={() => handleSort('surName')}
                  >
                    Student Name {sortColumn === 'surName' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th
                    className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base"
                    onClick={() => handleSort('parentName')}
                  >
                    Parent Name {sortColumn === 'parentName' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th
                    className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base"
                    onClick={() => handleSort('applicationNumber')}
                  >
                    Application Number {sortColumn === 'applicationNumber' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th
                    className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base"
                    onClick={() => handleSort('batch')}
                  >
                    Batch {sortColumn === 'batch' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th
                    className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base"
                    onClick={() => handleSort('primaryContact')}
                  >
                    Primary Contact {sortColumn === 'primaryContact' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </th>
                  <th className="px-2 py-2 text-center border-b border-gray-600 cursor-pointer text-xs md:text-base">Upload Photo</th>
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {currentStudents.map((student) => (
                  <tr
                    key={student._id}
                    className={`cursor-pointer ${
                      selectedRow === student._id ? 'bg-gray-700 text-white' : 'even:bg-gray-200 hover:bg-gray-400'
                    } transition-all duration-300`}
                    onClick={() => handleRowClick(student._id)}
                  >
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.surName} {student.firstName}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.parentName}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.applicationNumber}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.batch}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.primaryContact}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 text-center">
                      {student.googleDriveLink && (
                        <img src={student.googleDriveLink} alt="Student Photo" className="w-16 h-16 rounded-full" />
                      )}
                      <button 
                        className="btn btn-sm text-white rounded-full transition-all duration-300 bg-[#00A0E3] hover:bg-[#2D5990] transform hover:scale-105"
                        onClick={() => handleUploadClick(student)}
                      >
                        Upload Photo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <div className="text-center">
              <div className="flex justify-center">{getPageButtons()}</div>
            </div>
          </div>
          {modalOpen && (
            <UploadModal
              student={currentStudent}
              closeModal={closeModal}
              onClose={closeModal}
              isOpen={modalOpen}
              onLinkSubmitted={handleLinkSubmitted} // Pass the function to handle link submission
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateStudent;