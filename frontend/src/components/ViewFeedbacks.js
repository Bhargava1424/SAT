import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-lg shadow-lg max-h-screen overflow-auto transform transition-transform duration-300 ease-in-out scale-95 hover:scale-100">
        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-[#00A0E3] text-white rounded-md hover:bg-[#2D5990] transition duration-300">
          Close
        </button>
      </div>
    </div>
  );
}

function ViewFeedbacks() {
  const [students, setStudents] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editFeedback, setEditFeedback] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedFeedbacks, setSelectedFeedbacks] = useState([]);
  const [viewingDateFeedback, setViewingDateFeedback] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [addingFeedback, setAddingFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const role = sessionStorage.getItem('role');
    const userBranch = sessionStorage.getItem('branch');

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/students');
      const data = await response.json();

      let filteredStudents = data;
      if (role === 'director' || role === 'teacher' || role === 'vice president') {
        filteredStudents = data.filter(student => student.branch === userBranch);
      }

      setStudents(filteredStudents);

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred while fetching data');
      }
    } catch (error) {
      setError('Error fetching students: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filteredData = students.filter(
      item =>
        `${item.firstName} ${item.surName}`.toLowerCase().includes(value) ||
        item.parentName.toLowerCase().includes(value) ||
        item.applicationNumber.toString().includes(value) ||
        item.branch.toLowerCase().includes(value)
    );
    setSearchText(value);
    setStudents(filteredData);
  };

  const handleEditChange = (event) => {
    setEditText(event.target.value);
  };

  const handleNewFeedbackChange = (event) => {
    setNewFeedback(event.target.value);
  };

  const saveEdit = async () => {
    if (!editFeedback || !editFeedback.feedbackId) {
      setError('Feedback ID is missing.');
      return;
    }

    const updatedFeedback = {
      feedback: editText,
      reviewer: sessionStorage.getItem('name')
    };

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + `/feedbacks/${editFeedback.feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFeedback)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feedback');
      }

      // Update the UI optimistically
      const updatedStudents = students.map(student =>
        student.applicationNumber === editFeedback.applicationNumber
          ? { ...student, feedbacks: student.feedbacks.map(fb => (fb.feedbackId === editFeedback.feedbackId ? { ...fb, feedback: editText } : fb)) }
          : student
      );
      setStudents(updatedStudents);
      setViewingDateFeedback(null);
      setEditFeedback(null);
    } catch (error) {
      setError('Error updating feedback: ' + error.message);
    }
  };

  const fetchFeedbacks = async (applicationNumber) => {
    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + `/feedbacks/${applicationNumber}`);
      const data = await response.json();

      if (response.ok) {
        if (data.length === 0) {
          alert('No Feedbacks given for this Student');
        }
        return data;
      } else {
        throw new Error(data.error || 'An error occurred while fetching feedback data');
      }
    } catch (error) {
      setError('Error fetching feedbacks: ' + error.message);
      return [];
    }
  };

  const toggleFeedbackView = async (applicationNumber) => {
    const student = students.find(item => item.applicationNumber === applicationNumber);
    if (student) {
      const feedbacks = await fetchFeedbacks(applicationNumber);
      setSelectedFeedbacks(feedbacks);
      setSelectedStudentName(`${student.firstName} ${student.surName}`);
      setViewingDateFeedback(null);
      setEditFeedback(student); // Store the student object for potential edits
    } else {
      setError('Student not found for the provided application number.');
    }
  };

  const viewFeedbackByDate = (feedback) => {
    setViewingDateFeedback(feedback);
    setEditText(feedback.feedback);
    setEditFeedback(feedback);
  };

  const addFeedback = (applicationNumber) => {
    const student = students.find(item => item.applicationNumber === applicationNumber);
    if (student) {
      setSelectedStudentName(`${student.firstName} ${student.surName}`);
      setAddingFeedback(true);
    } else {
      console.error('Student not found for the provided application number:', applicationNumber);
    }
  };

  const submitNewFeedback = async () => {
    if (!newFeedback) {
      alert('Feedback cannot be empty');
      return;
    }

    const student = students.find(item => `${item.firstName} ${item.surName}` === selectedStudentName);
    const applicationNumber = student?.applicationNumber;
    const name = sessionStorage.getItem('name');

    if (!applicationNumber) {
      console.error('Application number not found for student:', selectedStudentName);
      return;
    }

    const payload = {
      studentName: selectedStudentName,
      feedback: newFeedback,
      date: new Date().toISOString(),
      applicationNumber: applicationNumber,
      reviewer: name
    };

    try {
      const response = await fetch(process.env.REACT_APP_BASE_URL + '/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Update UI optimistically by adding the new feedback to the selectedFeedbacks array
      setSelectedFeedbacks([...selectedFeedbacks, payload]);
      setAddingFeedback(false);
      setNewFeedback('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAndSendEmail = async (branch) => {
    // Implement email sending logic here
  };

  const addAssessment = (applicationNumber) => {
    const student = students.find(item => item.applicationNumber === applicationNumber);
    if (student) {
      const studentName = `${student.firstName} ${student.surName}`;
      navigate(`/eca/${applicationNumber}/${studentName}`);
    } else {
      console.error('Student not found for the provided application number:', applicationNumber);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-12 w-12 mb-4"></div>
        <h2 className="text-center text-white text-xl font-semibold">Loading...</h2>
        <p className="w-1/3 text-center text-white">This may take a few seconds, please don't close this page.</p>
      </div>
    );
  }
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const role = sessionStorage.getItem('role');

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 md:px-12 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2D5990]">View Feedbacks</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
              className="w-full md:w-auto px-4 py-2 mt-2 md:mt-0 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition duration-300"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead className="bg-[#00A0E3] text-white">
                <tr>
                  <th className="px-4 py-2 hidden md:table-cell">Profile</th>
                  <th className="px-4 py-2">Student Name</th>
                  <th className="px-4 py-2">Parent Name</th>
                  <th className="px-4 py-2">Application No.</th>
                  <th className="px-4 py-2">View Feedback</th>
                  {(role === 'vice president') && (
                    <>
                      <th className="px-4 py-2">Add Feedback</th>
                      <th className="px-4 py-2">Add & View Assessments</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {students.map(item => (
                  <tr key={item.applicationNumber} className="hover:bg-gray-100 transition duration-300">
                    <td className="px-4 py-2 hidden md:table-cell">
                      <img src={"/profileicon.jpeg"} alt="Profile" className="w-12 h-12 rounded-full mx-auto" />
                    </td>
                    <td className="px-4 py-2 text-center text-gray-700">{`${item.firstName} ${item.surName}`}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{item.parentName}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{item.applicationNumber}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => toggleFeedbackView(item.applicationNumber)}
                        className="bg-[#2D5990] text-white px-3 py-1 rounded-md hover:bg-[#00A0E3] transition duration-300"
                      >
                        {selectedFeedbacks.length > 0 && item.applicationNumber === editFeedback?.applicationNumber ? (
                          'Hide'
                        ) : (
                          'View'
                        )}
                      </button>
                    </td>
                    {(role === 'vice president') && (
                      <>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => addFeedback(item.applicationNumber)}
                            className="bg-[#2D5990] text-white px-3 py-1 rounded-md hover:bg-[#00A0E3] transition duration-300"
                          >
                            Add
                          </button>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => addAssessment(item.applicationNumber)}
                            className="bg-[#2D5990] text-white px-3 py-1 rounded-md hover:bg-[#00A0E3] transition duration-300"
                          >
                            Assess
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Feedback Modal */}
          {selectedFeedbacks.length > 0 && !viewingDateFeedback && (
            <Modal onClose={() => setSelectedFeedbacks([])}>
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#2D5990]">Feedback for {selectedStudentName}</h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedFeedbacks.map(fb => (
                    <div
                      key={fb.date}
                      className="flex justify-between items-center mb-2 p-2 border-b items-center bg-gray-100 rounded shadow text-xs md:text-lg"
                    >
                      <span className="mr-2">Dated:</span>
                      <button
                        onClick={() => viewFeedbackByDate(fb)}
                        className="text-[#00A0E3] hover:text-[#2D5990] transition duration-300"
                      >
                        {new Date(fb.date).toLocaleDateString()}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Modal>
          )}

          {/* Edit Feedback Modal */}
          {viewingDateFeedback && (
            <Modal
              onClose={() => {
                setViewingDateFeedback(null);
                setEditFeedback(null);
              }}
            >
              <h3 className="text-lg font-bold mb-4 text-[#2D5990]">Edit Feedback</h3>
              <textarea
                value={editText}
                onChange={handleEditChange}
                className="w-full p-2 border rounded bg-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
              />
              <button
                onClick={saveEdit}
                className="mt-4 px-4 py-2 bg-[#2D5990] text-white rounded-md hover:bg-[#00A0E3] transition duration-300 mr-4"
              >
                Save Changes
              </button>
            </Modal>
          )}

          {/* Add Feedback Modal */}
          {addingFeedback && (
            <Modal onClose={() => setAddingFeedback(false)}>
              <div>
                <h3 className="text-lg font-bold mb-4 text-[#2D5990]">Add Feedback for {selectedStudentName}</h3>
                <textarea
                  value={newFeedback}
                  onChange={handleNewFeedbackChange}
                  className="w-full p-2 border rounded bg-gray-200 resize-none mb-4 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
                  placeholder="Enter feedback here..."
                />
                <button
                  onClick={submitNewFeedback}
                  className="mt-4 px-4 py-2 bg-[#2D5990] text-white rounded-md hover:bg-[#00A0E3] transition duration-300"
                >
                  Submit
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewFeedbacks;