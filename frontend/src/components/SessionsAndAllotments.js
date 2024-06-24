import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar';
import { FaTimes } from 'react-icons/fa';

// Modal component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-1/3 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <FaTimes size={24} />
        </button>
        <div className='pt-8 pr-4'>
          {children}
        </div>
      </div>
    </div>
  );
};

const SessionAndAllotments = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBranch, setModalBranch] = useState('');
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [branches, setBranches] = useState([]);
  const [confirmReassign, setConfirmReassign] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('http://localhost:5000/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches data', error);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/sessions');
        setSessions(response.data);

        // Extract unique periods and teachers
        const periodsSet = new Set();
        const teachersSet = new Set();
        response.data.forEach(session => {
          periodsSet.add(session.period);
          teachersSet.add(session.teacher);
        });

        setPeriods([...periodsSet]);
        setAllTeachers([...teachersSet]);
      } catch (error) {
        console.error('Error fetching sessions', error);
      }
    };

    fetchSessions();
  }, []);

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const handleModalBranchChange = async (event) => {
    setModalBranch(event.target.value);

    // Fetch teacher and student count for the selected branch
    try {
      const teacherResponse = await axios.get(
        `http://localhost:5000/teachers/count-by-branch/${event.target.value}`
      );
      const studentResponse = await axios.get(
        `http://localhost:5000/students/count-by-branch/${event.target.value}`
      );

      setTeacherCount(teacherResponse.data.count);
      setStudentCount(studentResponse.data.count);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleReassignClick = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/teachers/branch/${modalBranch}`);
      // Filter the teachers to include only those with the role 'teacher'
      const filteredTeachers = response.data.filter(teacher => teacher.role === 'teacher');
      setTeachers(filteredTeachers);
      setConfirmReassign(true);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };
  
  const handleConfirmReassign = () => {
    setConfirmReassign(false);
  };

  const handleCancelReassign = () => {
    setConfirmReassign(false);
  };

  const handleTeacherSelect = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    const selectedTeacherObjects = selectedOptions.map((teacherId) =>
      teachers.find((teacher) => teacher._id === teacherId)
    );
    setSelectedTeachers(selectedTeacherObjects);
  };

  const handleConfirmReassignWithSelectedTeachers = async () => {
    try {
      const response = await axios.post('http://localhost:5000/sessions/reassign', {
        branch: modalBranch,
        batch: '2024-2026',
        teachers: selectedTeachers,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderSessionsTable = (branch) => {
    const branchSessions = branch === 'All' ? sessions : sessions.filter(session => session.branch === branch);
    const branchPeriods = new Set(branchSessions.map(session => session.period));
    const branchTeachers = new Set(branchSessions.map(session => session.teacher));

    return (
      <div key={branch} className="mb-12">
        <h2 className="text-2xl font-bold my-4 text-center text-[#2D5990]">{branch === 'All' ? 'All Branches' : branch}</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Period</th>
              {[...branchTeachers].map((teacher, index) => (
                <th key={index} className="py-2 px-4 border">{teacher}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...branchPeriods].map((period, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border">{period}</td>
                {[...branchTeachers].map((teacher, teacherIndex) => {
                  const session = branchSessions.find(session => session.period === period && session.teacher === teacher);
                  return (
                    <td key={teacherIndex} className="py-2 px-4 border">
                      {session ? (
                        <>
                          <p>Cluster ID: {session.clusterID}</p>
                          <p>Branch: {session.branch}</p>
                          <p>Status: {session.status}</p>
                        </>
                      ) : 'N/A'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4">
      <Navbar />
      <h1 className="text-4xl font-bold my-8 text-center text-[#2D5990]">
        Sessions and Allotments
      </h1>
      <div className="my-6 flex justify-center items-center">
        <label className="mr-4 text-xl font-medium text-[#2D5990]">
          Select Start Date:
        </label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
        />
        <label className="ml-8 mr-4 text-xl font-medium text-[#2D5990]">
          Select Branch:
        </label>
        <select
          value={selectedBranch}
          onChange={handleBranchChange}
          className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
        >
          <option value="All">All</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch.branchCode}>
              {branch.branchCode}
            </option>
          ))}
        </select>
        <button
          className="bg-[#2D5990] text-white font-medium py-2 px-4 rounded-lg ml-4 hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
          onClick={() => setIsModalOpen(true)}
        >
          Manage Sessions
        </button>
      </div>

      {/* Render tables */}
      {selectedBranch === 'All' ? (
        branches.map(branch => renderSessionsTable(branch.branchCode))
      ) : (
        renderSessionsTable(selectedBranch)
      )}

      {/* Modal with Close Button */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <label className="text-lg font-medium text-[#2D5990] w-1/3">
              Select Branch:
            </label>
            <select
              value={modalBranch}
              onChange={handleModalBranchChange}
              className="flex-grow border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-200"
            >
              <option value="">Select Branch</option>
              {branches.map((branch) => (
                <option key={branch._id} value={branch.branchCode}>
                  {branch.branchCode}
                </option>
              ))}
            </select>
          </div>

          {modalBranch && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
              <p className="font-medium">
                Branch Statistics:
              </p>
              <p>
                Teachers: <span className="font-bold">{teacherCount}</span>
              </p>
              <p>
                Students: <span className="font-bold">{studentCount}</span>
              </p>
            </div>
          )}

          {confirmReassign ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
              <p className="font-medium">
                Are you sure you want to re-assign sessions? This makes major irreversible changes in the application!!
              </p>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  onClick={handleConfirmReassign}
                >
                  Yes
                </button>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  onClick={handleCancelReassign}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                className={`w-full bg-[#2D5990] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-300 ${
                  modalBranch ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!modalBranch}
                onClick={handleReassignClick}
              >
                Reassign Session
              </button>

              {teachers.length > 0 && (
                <>
                  <div className="mt-6">
                    <label className="text-lg font-medium text-[#2D5990]">
                      Select Teachers:
                    </label>
                    <select
                      multiple
                      value={selectedTeachers.map((teacher) => teacher._id)}
                      onChange={handleTeacherSelect}
                      className="w-full h-32 border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
                    >
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedTeachers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium text-[#2D5990]">Selected Teachers:</h3>
                      <ul className="list-disc list-inside">
                        {selectedTeachers.map((teacher) => (
                          <li key={teacher._id}>{teacher.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    className="w-full bg-[#2D5990] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-300 mt-4"
                    onClick={handleConfirmReassignWithSelectedTeachers}
                  >
                    Confirm Reassign with the Selected Teachers
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SessionAndAllotments;
