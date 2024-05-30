import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded max-h-screen overflow-auto">
        {children}
        <button onClick={onClose} className="mt-4 p-2 bg-[#00A0E3] text-white rounded">Close</button>
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
  const [addingAssessment, setAddingAssessment] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    const role = sessionStorage.getItem('role');
    const userBranch = sessionStorage.getItem('branch');

    try {
        const response = await fetch('http://localhost:5000/students');
        const data = await response.json();

        // Filter students based on branch for specific roles
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
    const filteredData = students.filter(item =>
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

// Update feedback by feedbackId
const saveEdit = async () => {
  if (!editFeedback || !editFeedback.feedbackId) {
    setError('Feedback ID is missing.');
    return;
  }

  const updatedFeedback = {
    feedback: editText,
    reviewer: sessionStorage.getItem('name') // Assume the reviewer might be updated as well
  };

  try {
    const response = await fetch(`http://localhost:5000/feedbacks/${editFeedback.feedbackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFeedback)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update feedback');
    }

    // setEditFeedback(null); // Reset after successful update
    // setViewingDateFeedback(null);
    // fetchFeedbacks(); // Refresh data
    window.location.reload();
  } catch (error) {
    setError('Error updating feedback: ' + error.message);
  }
};

  
  
  


const fetchFeedbacks = async (applicationNumber) => {
  try {
    const response = await fetch(`http://localhost:5000/feedbacks/${applicationNumber}`);
    const data = await response.json();

    if (response.ok) {
      if (data.length === 0) { // Assuming 'data' is an array
        alert("No Feedbacks given for this Student");
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
      setEditFeedback(student); // Set the student being edited
    } else {
      setError('Student not found for the provided application number.');
    }
  };
  
  

  const viewFeedbackByDate = (feedback) => {
    const student = students.find(item => item.applicationNumber === feedback.applicationNumber);
    if (student) {
      setViewingDateFeedback(feedback); // This contains all feedback details, including feedbackId
      setEditText(feedback.feedback);
      setEditFeedback(feedback); // Now, editFeedback contains the entire feedback object, including feedbackId
    } else {
      setError('Student not found for the provided application number.');
    }
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
  
// Submit new feedback
const submitNewFeedback = async () => {
  if (!newFeedback) {
    alert("Feedback cannot be empty");
    return;
  }

  const student = students.find(item => `${item.firstName} ${item.surName}` === selectedStudentName);
  const applicationNumber = student?.applicationNumber;
  const name = sessionStorage.getItem('name'); // Ensure this is retrieved correctly

  if (!applicationNumber) {
    console.error('Application number not found for student:', selectedStudentName);
    return;
  }

  const payload = {
    studentName: selectedStudentName,
    feedback: newFeedback,
    date: new Date().toISOString(), // current date and time
    applicationNumber: applicationNumber,
    reviewer: name
  };

  try {
    const response = await fetch('http://localhost:5000/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    await fetchAndSendEmail(student.branch);

    fetchFeedbacks(); // Refresh the students list to include new feedback
    setAddingFeedback(false);
    setNewFeedback('');
  } catch (error) {
    console.error('Error:', error);
  }
};

// Fetch director's Gmail and send an email
const fetchAndSendEmail = async (branch) => {
    try {
        const gmailResponse = await fetch(`http://localhost:5000/teachers/director-gmail/${branch}`);
        const { gmail } = await gmailResponse.json();

        if (gmailResponse.ok) {
            // Send an email notification to the director's Gmail
            // await fetch('http://localhost:5000/send-email', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         to: gmail,
            //         subject: 'New Feedback Submitted',
            //         body: `A new feedback has been submitted by for student ${selectedStudentName}.`
            //     })
            // });
            console.log('Email sending triggered: ',{gmail});
        } else {
            throw new Error('Failed to fetch director’s Gmail');
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
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
  

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const role = sessionStorage.getItem('role');

  return (
    <div className='bg-white min-h-screen'>
      <Navbar />
      <div className="bg-gray-400 rounded-3xl mx-2 md:mx-6 px-4 md:px-32 py-6">
        <div className="relative flex flex-col items-center justify-between mb-4 space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-center">View Feedbacks</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            className="w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4 text-xs md:text-sm">
          <div className={`grid ${role === 'vice president' ? 'grid-cols-7' : 'grid-cols-5'} gap-4 items-center bg-gray-100 p-3 rounded shadow text-xxs md:text-lg`}>
            <div className="hidden md:flex justify-center">Profile</div>
            <div className="flex justify-center">Student Name</div>
            <div className="flex justify-center">Parent Name</div>
            <div className="flex justify-center">Application No.</div>
            <div className="flex justify-center">View Feedback</div>
            {(role === 'vice president') && (
              <>
                <div className="flex justify-center">Add Feedback</div>
                <div className="flex justify-center">Add & View Assessments</div>
              </>
            )}
          </div>
          {students.map(item => (
            <div key={item.applicationNumber} className={`grid ${role === 'vice president' ? 'grid-cols-7' : 'grid-cols-5'} gap-6 items-center bg-gray-100 p-3 rounded shadow text-xs md:text-lg`}>
              <div className="hidden md:flex justify-center">
                <img src={"/profileicon.jpeg"} alt="Profile" className="w-12 h-12 rounded-full flex items-center justify-center" />
              </div>
              <div className="flex justify-center">{`${item.firstName} ${item.surName}`}</div>
              <div className="flex justify-center">{item.parentName}</div>
              <div className="flex justify-center">{item.applicationNumber}</div>
              <div className="flex justify-center">
                <button onClick={() => toggleFeedbackView(item.applicationNumber)} className="text-blue-500 hover:text-blue-700">
                  <img src={selectedFeedbacks.length > 0 ? "/open.jpg" : "/close.jpg"} alt="View" className="h-4 w-4 md:w-8 md:h-6" />
                </button>
              </div>
              {(role === 'vice president') && (
                <>
                  <div className="flex justify-center">
                    <button
                      onClick={() => addFeedback(item.applicationNumber)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <img src={'/plus.jpg'} alt="Add" className="h-3 w-3 md:h-6 md:w-6" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => addAssessment(item.applicationNumber)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <img src={'/edit.jpeg'} alt="Edit" className="h-4 w-6 md:h-6 md:w-8" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {selectedFeedbacks.length > 0 && !viewingDateFeedback && (
          <Modal onClose={() => setSelectedFeedbacks([])}>
            <div>
              <h3 className="text-lg font-bold mb-4">{selectedStudentName}</h3>
              <div className="max-h-60 overflow-y-auto">
                {selectedFeedbacks.map(fb => (
                  <div key={fb.date} className="flex justify-between items-center mb-2 p-2 border-b items-center bg-gray-100 rounded shadow text-xs md:text-lg">
                    <span className='mr-2'>Dated:</span>
                    <button onClick={() => viewFeedbackByDate(fb)} className="text-blue-500 hover:text-blue-700 flex justify-center">
                      {new Date(fb.date).toLocaleDateString()} {/* Format the date */}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}


        {viewingDateFeedback && (
          <Modal onClose={() => {
            setViewingDateFeedback(null);
            setEditFeedback(null);
          }}>
            <textarea value={editText} onChange={handleEditChange} className="w-full p-2 border rounded bg-gray-200" />
            <button onClick={saveEdit} className="mt-4 p-2 bg-[#2D5990] text-white rounded mr-4">Save Changes</button>
          </Modal>
        )}

        {addingFeedback && (
          <Modal onClose={() => setAddingFeedback(false)}>
            <div>
              <h3 className="text-lg font-bold mb-4">{selectedStudentName}</h3>
              <textarea
                value={newFeedback}
                onChange={handleNewFeedbackChange}
                className="w-full p-2 border rounded bg-gray-200 mb-4"
                placeholder="Enter feedback here..."
              />
              <button onClick={submitNewFeedback} className="mt-4 p-2 bg-[#2D5990] text-white rounded mr-4">Submit</button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export default ViewFeedbacks;
