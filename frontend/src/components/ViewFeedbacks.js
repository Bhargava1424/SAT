import React, { useState } from 'react';
import Navbar from './Navbar';

// Initialize the viewingFeedback state in the dummy data
const feedbackData = [
  {
    id: 1,
    studentName: "John Doe",
    parentName: "Jane Doe",
    branch: "Science",
    pictureUrl: "/profileicon.jpeg",
    feedback: "John has shown remarkable improvement in his science subjects.",
    viewingFeedback: false
  },
  {
    id: 2,
    studentName: "Emily Rose",
    parentName: "David Rose",
    branch: "Arts",
    pictureUrl: "/profileicon.jpeg",
    feedback: "Emily is very creative and excels in her artistic projects.",
    viewingFeedback: false
  },
  // Add more data as needed
];

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded">
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

  const saveEdit = () => {
    const updatedData = data.map(item => {
      if (item.id === editFeedback.id) {
        return { ...item, feedback: editText };
      }
      return item;
    });
    setData(updatedData);
    setEditFeedback(null);
  };

  const toggleFeedbackView = (id) => {
    const newData = data.map(item => {
      if (item.id === id) {
        return {...item, viewingFeedback: !item.viewingFeedback};
      }
      return item;
    });
    setData(newData);
  };

  return (
<div>
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
            <div className="grid grid-cols-5 md:grid-cols-6 gap-4 items-center bg-gray-100 p-3 rounded shadow text-xs md:text-lg">
                <div className="hidden md:flex justify-center">Profile</div>
                <div className="flex justify-center">Student Name</div>
                <div className="flex justify-center">Parent Name</div>
                <div className="flex justify-center">Student ID</div>
                <div className="flex justify-center">View Feedback</div>
                <div className="flex justify-center">Edit Feedback</div>
            </div>
            {data.map(item => (
                <div key={item.id} className="grid grid-cols-5 md:grid-cols-6 gap-4 items-center bg-gray-100 p-3 rounded shadow text-xs md:text-lg">
                    <div className="hidden md:flex justify-center">
                        <img src={item.pictureUrl} alt="Profile" className="w-12 h-12 rounded-full flex items-center justify-center" />
                    </div>
                    <div className="flex justify-center">{item.studentName}</div>
                    <div className="flex justify-center">{item.parentName}</div>
                    <div className="flex justify-center">{item.id}</div>
                    <div className="flex justify-center">
                        <button onClick={() => toggleFeedbackView(item.id)} className="text-blue-500 hover:text-blue-700">
                            <img src={item.viewingFeedback ? "/open.jpg" : "/close.jpg"} alt="View" className="w-8 h-6" />
                        </button>
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => {
                                setEditFeedback(item);
                                setEditText(item.feedback);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <img src={'/edit.jpeg'} alt="Edit" className="h-6 w-8" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {data.find(item => item.viewingFeedback) && (
            <Modal onClose={() => toggleFeedbackView(data.find(item => item.viewingFeedback).id)}>
                <p className="text-justify">{data.find(item => item.viewingFeedback).feedback}</p>
            </Modal>
        )}

        {editFeedback && (
            <Modal onClose={() => setEditFeedback(null)}>
                <textarea value={editText} onChange={handleEditChange} className="w-full p-2 border rounded bg-gray-200" />
                <button onClick={saveEdit} className="mt-4 p-2 bg-[#2D5990] text-white rounded mr-4">Save Changes</button>
            </Modal>
        )}
    </div>
</div>










  );
}

export default ViewFeedbacks;
