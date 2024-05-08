import React, { useState, useEffect } from 'react';

const UpadateStudent = () => {
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
      const response = await fetch('http://localhost:5000/students');
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
      // If there are 5 or fewer pages, show all buttons
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`px-4 py-2 mr-2 ${
              currentPage === i ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-400'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // If there are more than 5 pages, show first 2, current, and last 2 buttons
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`px-4 py-2 mr-2 ${
            currentPage === 1 ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-400'
          }`}
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
            className="px-4 py-2 mr-2 bg-gray-200 hover:bg-gray-400"
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
            className="px-4 py-2 mr-2 bg-gray-700 text-white"
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
            className="px-4 py-2 mr-2 bg-gray-200 hover:bg-gray-400"
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
            currentPage === totalPages ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-400'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (

    <div className="bg-gray-400 rounded-3xl mx-6">
        <div className="px-32 py-6">
        <div className="relative flex items-center justify-between mb-4">
          {/* Search box on the left */}
          <div className="flex-none">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Heading in the middle */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-2xl font-bold">Upadate Student</h2>
          </div>

          {/* Pagination controls on the right */}
          <div className="flex-none">
            <div className="inline-flex">{getPageButtons()}</div>
          </div>
        </div>



            
        <div className="overflow-x-auto">
            <table className="w-full table-auto bg-white border-collapse border border-gray-600">
            <thead className="bg-[#2D5990] text-white">
                <tr>
                <th
                    className="px-4 py-2 text-center border-b border-gray-600 border-r cursor-pointer"
                    onClick={() => handleSort('surName')}
                >
                    Student Name {sortColumn === 'surName' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th
                    className="px-4 py-2 text-center border-b border-gray-600 border-r cursor-pointer"
                    onClick={() => handleSort('parentName')}
                >
                    Parent Name {sortColumn === 'parentName' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th
                    className="px-4 py-2 text-center border-b border-gray-600 border-r cursor-pointer"
                    onClick={() => handleSort('applicationNumber')}
                >
                    Application Number {sortColumn === 'applicationNumber' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th
                    className="px-4 py-2 text-center border-b border-gray-600 border-r cursor-pointer"
                    onClick={() => handleSort('batch')}
                >
                    Batch {sortColumn === 'batch' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th
                    className="px-4 py-2 text-center border-b border-gray-600 border-r cursor-pointer"
                    onClick={() => handleSort('primaryContact')}
                >
                    Primary Contact {sortColumn === 'primaryContact' && <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th className="px-4 py-2 text-center border-b border-gray-600">Generate Report</th>
                </tr>
            </thead>
            <tbody>
                {currentStudents.map((student) => (
                <tr
                    key={student._id}
                    className={`cursor-pointer ${
                    selectedRow === student._id ? 'bg-gray-700 text-white' : 'even:bg-gray-200 hover:bg-gray-400'
                    }`}
                    onClick={() => handleRowClick(student._id)}
                >
                    <td className="px-4 py-2 border-b border-gray-600 border-r">
                    {student.surName} {student.firstName}
                    </td>
                    <td className="px-4 py-2 border-b border-gray-600 border-r">{student.parentName}</td>
                    <td className="px-4 py-2 border-b border-gray-600 border-r">{student.applicationNumber}</td>
                    <td className="px-4 py-2 border-b border-gray-600 border-r">{student.batch}</td>
                    <td className="px-4 py-2 border-b border-gray-600 border-r">{student.primaryContact}</td>
                    <td className="px-4 py-2 border-b border-gray-600 text-center">
                    <button 
                        className="btn btn-sm text-white" style={{ backgroundColor: '#00A0E3' }}
                        onClick={() => handleUploadClick(student)}  // Pass the student object correctly
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
          {modalOpen && <UploadModal student={currentStudent} closeModal={closeModal} />}
        </div>
    </div>
    
  );
};

const UploadModal = ({ student, closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-3xl relative">
        {/* Close Icon at top right */}
        <button onClick={closeModal} className="absolute top-3 right-3 text-lg text-gray-700 hover:text-red-700">
          <span><strong>x</strong></span>
        </button>

        <h2 className="text-lg">Upload Photo for <strong>{student.surName} {student.firstName}</strong></h2>
        <div>
          <p className='m-2'>Application Number: <strong>{student.applicationNumber}</strong> </p>
          <p className='m-2'>Parent Name: <strong>{student.parentName}</strong> </p>
          <p className='m-2'>Phone Number: <strong>{student.primaryContact}</strong> </p>
          <p className='m-2'>Batch: <strong>{student.batch}</strong> </p>
        </div>
        <div className="mt-4">
          <button
            className="bg-[#00A0E3] text-white px-4 py-2 mr-2 hover:bg-[#008EC3] rounded-2xl"
            onClick={() => {}}>
            Open Camera
          </button>
          <button
            className="bg-[#00A0E3] text-white px-4 py-2 hover:bg-[#008EC3] rounded-2xl"
            onClick={() => {}}>
            Upload File
          </button>
        </div>
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white hover:bg-red-700 rounded-2xl"
          onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};


export default UpadateStudent;

