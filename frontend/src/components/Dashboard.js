
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import profileImage from '../assets/profile.jpg';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const navigate = useNavigate(); 

  const handleGenerateReport = (applicationNumber) => {
    navigate(`/studentReport/${applicationNumber}`);
  };


  useEffect(() => {
    fetchStudents();
    console.log(students)
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
    const role = sessionStorage.getItem('role');
    const userBranch = sessionStorage.getItem('branch');

    try {
        const response = await fetch(process.env.REACT_APP_BASE_URL + '/students');
        const data = await response.json();

        // Check if the student.photo is google drive link
        data.forEach(student => {
          if (student.photo && student.photo.includes('drive')) {
            const linkId = student.photo.split('/d/')[1].split('/view')[0];
            student.photo = `https://drive.google.com/thumbnail?id=${linkId}`;
            console.log(student.photo);
          }
        });
        
        // Filter students based on branch for specific roles
        if (role === 'director' || role === 'teacher' || role === 'vice president') {
            const filteredStudents = data.filter(student => student.branch === userBranch);
            setStudents(filteredStudents);
        } else {
            setStudents(data);
        }
        
        if (!response.ok) {
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
    const studentValues = Object.values(student).map((value) => value ? value.toString().toLowerCase() : '');

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
      const valueA = a[sortColumn] ? a[sortColumn].toString().toLowerCase() : '';
      const valueB = b[sortColumn] ? b[sortColumn].toString().toLowerCase() : '';

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

  const role = sessionStorage.getItem('role');

  const handleImageClick = (src) => {
    setModalImageSrc(src);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
              <h2 className="text-md md:text-2xl font-bold text-center md:text-left text-[#2D5990]">STUDENT DASHBOARD</h2>
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
                    className="px-2 py-3 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base " 
                  >
                    Photo
                  </th>
                  <th
                    className="px-2 py-3 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base "
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
                  {role !== 'teacher' && (
                    <th className="px-2 py-2 text-center border-b border-gray-600 border-r cursor-pointer text-xs md:text-base">
                      Generate Report
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr
                    key={student._id}
                    className={`cursor-pointer ${
                      selectedRow === student._id ? 'bg-[#00A0E3] text-white' : 'even:bg-gray-200 hover:bg-gray-400'
                    } transition-all duration-300`}
                    onClick={() => handleRowClick(student._id)}
                  >
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">
                      <div className="flex items-center justify-center">
                        <img
                          src={student.photo || profileImage}
                          alt="Student Profile"
                          className="w-8 h-8 md:w-12 md:h-12 rounded-full transition-transform duration-300 transform hover:scale-110 cursor-pointer"
                          onClick={() => handleImageClick(student.photo || profileImage)}
                          onError={(e) => {
                            e.target.onerror = null; // Prevents looping
                            e.target.src = profileImage;
                          }}
                        />
                      </div>
                    </td>


                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.surName} {student.firstName}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.parentName}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.applicationNumber}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.batch}</td>
                    <td className="px-2 py-1 md:py-2 border-b border-gray-600 border-r md:text-base text-xs">{student.primaryContact}</td>
                    {role !== 'teacher' && (
                      <td className="px-2 py-1 md:py-2 border-b border-gray-600 text-center">
                      <button
                        className="btn btn-sm text-white rounded-full transition-all duration-300 bg-[#00A0E3] hover:bg-[#2D5990] transform hover:scale-105"
                        onClick={() => handleGenerateReport(student.applicationNumber)} // Add onClick handler
                      >
                        Generate Report
                      </button>
                    </td>
                    )}
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
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-4 rounded-lg shadow-lg w-96 ">
            <img src={modalImageSrc} alt="Enlarged Profile" className="max-w-full h-auto rounded-lg" />
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-[#2D5990] text-white rounded-full transition-all duration-300 hover:bg-[#00A0E3]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
