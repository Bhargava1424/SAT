import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, branches, onSuccess }) => {
  const [modalBranch, setModalBranch] = useState('');
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [confirmReassign, setConfirmReassign] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [reassignSessionButton, setReassignSessionButton] = useState(true);
  const [useUpcomingMonday, setUseUpcomingMonday] = useState(true);

  const role = sessionStorage.getItem('role');
  const userBranch = sessionStorage.getItem('branch');

  useEffect(() => {
    if (!isOpen) {
      setModalBranch('');
      setTeacherCount(0);
      setStudentCount(0);
      setConfirmReassign(false);
      setTeachers([]);
      setSelectedTeachers([]);
      setIsLoading(false);
      setSuccessMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      setReassignSessionButton(true);
    }
  };

  const handleModalBranchChange = async (event) => {
    setModalBranch(event.target.value);
    try {
      const teacherResponse = await axios.get(
        process.env.REACT_APP_BASE_URL + `/teachers/branch/${event.target.value}`
      );
      const studentResponse = await axios.get(
        process.env.REACT_APP_BASE_URL + `/students/count-by-branch/${event.target.value}`
      );
      const filteredTeachers = teacherResponse.data.filter((teacher) => teacher.role === 'teacher');
      setTeacherCount(filteredTeachers.length);
      setStudentCount(studentResponse.data.count);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleReassignClick = async () => {
    setReassignSessionButton(false);
    try {
      const response = await axios.get(process.env.REACT_APP_BASE_URL + `/teachers/branch/${modalBranch}`);
      const filteredTeachers = response.data.filter((teacher) => teacher.role === 'teacher');
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
    setIsLoading(true);
    try {
      const response = await axios.post(process.env.REACT_APP_BASE_URL + '/sessions/reassign', {
        branch: modalBranch,
        batch: '2024-2026',
        teachers: selectedTeachers,
        upcomingMonday: useUpcomingMonday,
      });
      console.log(response.data);
      setSuccessMessage('Reassignment successful!');
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = role === 'director' ? branches.filter(branch => branch.branchCode === userBranch) : branches;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md lg:max-w-xl relative max-h-screen overflow-y-auto">

        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          onClick={() => {
            onClose();
            setReassignSessionButton(true);
          }}
        >
          <FaTimes size={24} />
        </button>

        <div className="pt-8 pr-4 space-y-6">
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
              {filteredBranches.map((branch) => (
                <option key={branch._id} value={branch.branchCode}>
                  {branch.branchCode}
                </option>
              ))}
            </select>
          </div>

          {modalBranch && (
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md">
              <p className="font-medium">Branch Statistics:</p>
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
                  onClick={() => {
                    onClose();
                    setReassignSessionButton(true);
                  }}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <>
              {reassignSessionButton && (
                <button
                  className={`w-full bg-[#2D5990] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-300 ${
                    modalBranch ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  disabled={!modalBranch}
                  onClick={handleReassignClick}
                >
                  Reassign Session
                </button>
              )}

              {teachers.length > 0 && (
                <>
                  <div className="mt-6">
                    <p className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md mt-4">
                      <strong>Important Note:</strong> Hold <kbd className="bg-gray-200 rounded px-1">Ctrl</kbd> (or <kbd className="bg-gray-200 rounded px-1">Cmd</kbd> on Mac) to select multiple teachers. Hold <kbd className="bg-gray-200 rounded px-1">Shift</kbd> to select a range of teachers.
                    </p>

                    <label className="text-lg font-medium text-[#2D5990]">Select Teachers:</label>
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
                  <div>
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
                    <div className="flex items-center space-x-2 mt-4">
                      <label className="text-sm font-medium text-gray-700">Use upcoming Monday:</label>
                      <input
                        type="checkbox"
                        checked={useUpcomingMonday}
                        onChange={(e) => setUseUpcomingMonday(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-[#2D5990]"
                      />
                    </div>
                  </div>
                  <button
                    className="w-full bg-[#2D5990] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-300 mt-4"
                    onClick={handleConfirmReassignWithSelectedTeachers}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex justify-center items-center">
                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          ></path>
                        </svg>
                        Reassigning...
                      </span>
                    ) : (
                      'Confirm Reassign with the Selected Teachers'
                    )}
                  </button>
                </>
              )}
            </>
          )}
          {successMessage && (
            <div className="mt-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md">
              <p>{successMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
