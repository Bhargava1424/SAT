import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

// Initialize the viewingFeedback state in the dummy data
const feedbackData = [
  {
    id: 1,
    studentName: "John Doe",
    parentName: "Jane Doe",
    branch: "Science",
    pictureUrl: "/profileicon.jpeg",
    feedbacks: [
      { date: "2024-01-10", feedback: "John has shown remarkable improvement in his science subjects." },
      { date: "2024-03-15", feedback: "John needs to focus more on his assignments." },
      { date: "2024-05-10", feedback: "John has shown remarkable improvement in his science subjects." },
      { date: "2024-06-15", feedback: "John needs to focus more on his assignments." },
      { date: "2024-07-10", feedback: "John has shown remarkable improvement in his science subjects." },
      { date: "2024-08-15", feedback: "John needs to focus more on his assignments." }
    ],
    viewingFeedback: false
  },
  {
    id: 2,
    studentName: "Emily Rose",
    parentName: "David Rose",
    branch: "Arts",
    pictureUrl: "/profileicon.jpeg",
    feedbacks: [
      { date: "2024-02-20", feedback: "Emily is very creative and excels in her artistic projects." },
      { date: "2024-04-05", feedback: "Emily should participate more in group activities." }
    ],
    viewingFeedback: false
  },
  // Add more data as needed
];

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
  const [data, setData] = useState(feedbackData);
  const [searchText, setSearchText] = useState('');
  const [editFeedback, setEditFeedback] = useState(null);
  const [editText, setEditText] = useState('');
  const [selectedFeedbacks, setSelectedFeedbacks] = useState([]);
  const [viewingDateFeedback, setViewingDateFeedback] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [addingFeedback, setAddingFeedback] = useState(false);
  const [newFeedback, setNewFeedback] = useState('');
  const [addingAssessment, setAddingAssessment] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    const filteredData = feedbackData.filter(item =>
      item.studentName.toLowerCase().includes(value) ||
      item.parentName.toLowerCase().includes(value) ||
      item.id.toString().includes(value) ||
      item.branch.toLowerCase().includes(value)
    );
    setSearchText(value);
    setData(filteredData);
  };

  const handleEditChange = (event) => {
    setEditText(event.target.value);
  };

  const handleNewFeedbackChange = (event) => {
    setNewFeedback(event.target.value);
  };

  const saveEdit = () => {
    const updatedData = data.map(item => {
      if (item.id === editFeedback.id) {
        return {
          ...item,
          feedbacks: item.feedbacks.map(fb => fb.date === viewingDateFeedback.date ? { ...fb, feedback: editText } : fb)
        };
      }
      return item;
    });
    setData(updatedData);
    setEditFeedback(null);
    setViewingDateFeedback(null);
  };

  const toggleFeedbackView = (id) => {
    const student = data.find(item => item.id === id);
    setSelectedFeedbacks(student.feedbacks);
    setSelectedStudentName(student.studentName);
    setViewingDateFeedback(null);
  };

  const viewFeedbackByDate = (feedback) => {
    setViewingDateFeedback(feedback);
    setEditText(feedback.feedback);
  };

  const addFeedback = (id) => {
    const student = data.find(item => item.id === id);
    setSelectedStudentName(student.studentName);
    setAddingFeedback(true);
  };

  const submitNewFeedback = () => {
    if (!newFeedback) {
      alert("Feedback cannot be empty");
      return;
    }
    const payload = {
      studentName: selectedStudentName,
      feedback: newFeedback,
      date: new Date().toISOString().split('T')[0] // current date
    };
    console.log(payload);
    setAddingFeedback(false);
    setNewFeedback('');
  };

  const addAssessment = (id) => {
    const student = data.find(item => item.id === id);
    navigate(`/feedback/${student.studentName}`);
  };

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
            <div className="flex justify-center">Student ID</div>
            <div className="flex justify-center">View Feedback</div>
            {(role === 'vice president') && (
              <>
                <div className="flex justify-center">Add Feedback</div>
                <div className="flex justify-center">Add Assessment</div>
              </>
            )}
          </div>
          {data.map(item => (
            <div key={item.id} className={`grid ${role === 'vice president' ? 'grid-cols-7' : 'grid-cols-5'} gap-6 items-center bg-gray-100 p-3 rounded shadow text-xs md:text-lg`}>
              <div className="hidden md:flex justify-center">
                <img src={item.pictureUrl} alt="Profile" className="w-12 h-12 rounded-full flex items-center justify-center" />
              </div>
              <div className="flex justify-center">{item.studentName}</div>
              <div className="flex justify-center">{item.parentName}</div>
              <div className="flex justify-center">{item.id}</div>
              <div className="flex justify-center">
                <button onClick={() => toggleFeedbackView(item.id)} className="text-blue-500 hover:text-blue-700">
                  <img src={selectedFeedbacks.length > 0 ? "/open.jpg" : "/close.jpg"} alt="View" className="h-4 w-4 md:w-8 md:h-6" />
                </button>
              </div>
              {(role === 'vice president') && (
                <>
                  <div className="flex justify-center">
                    <button
                      onClick={() => addFeedback(item.id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <img src={'/plus.jpg'} alt="Add" className="h-3 w-3 md:h-6 md:w-6" />
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => addAssessment(item.id)}
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
                    <button onClick={() => viewFeedbackByDate(fb)} className="text-blue-500 hover:text-blue-700 flex justify-center">{fb.date}</button>
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
