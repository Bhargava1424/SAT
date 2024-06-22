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

const Tooltip = ({ tooltipText }) => {
  return (
    <div className="relative inline-block">
      <div className="absolute bottom-0 left-0 hidden group-hover:block w-48 p-2 text-sm text-white bg-[#2D5990] rounded-md shadow-lg z-10">
        {tooltipText}
      </div>
    </div>
  );
};

const SessionAndAllotments = () => {
  const [sessions, setSessions] = useState([]);
  const [transformedData, setTransformedData] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBranch, setModalBranch] = useState('');
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/sessions');
        setSessions(response.data);
      } catch (error) {
        console.error('Error fetching session data', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/branches');
        console.log(response.data);
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching session data', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      filterDataByDate(sessions, startDate);
    }
  }, [sessions, startDate]);

  const filterDataByDate = (data, date) => {
    const filteredData = data.filter((session) => {
      const sessionDate = new Date(session.startDate);
      return sessionDate >= date;
    });

    const groupedData = {};
    const branches = {};

    filteredData.forEach((session) => {
      const { period, subject, status, clusterID } = session;
      const branch = clusterID.substring(2, 5);

      if (!branches[branch]) {
        branches[branch] = [];
      }

      if (!groupedData[branch]) {
        groupedData[branch] = {};
      }

      if (!groupedData[branch][period] && branches[branch].length < 8) {
        groupedData[branch][period] = {
          period,
          Mathematics: { status: 'N/A', clusterID: '' },
          Physics: { status: 'N/A', clusterID: '' },
          Chemistry: { status: 'N/A', clusterID: '' },
        };
        branches[branch].push(period);
      }

      if (groupedData[branch][period]) {
        groupedData[branch][period][subject] = { status, clusterID };
      }
    });

    setTransformedData(groupedData);
  };

  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
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

  const startYear = 2020;
  const endYear = 2050; // Adjust this to your required end year

  // Generate year ranges
  const yearRanges = [];
  for (let year = startYear; year < endYear; year += 2) {
    yearRanges.push(`${year} - ${year + 2}`);
  }

  const renderTable = (branch) => {
    return (
      <div key={branch} className="mb-12">
        <h2 className="text-3xl font-semibold my-6 text-[#2D5990]">Branch: {branch}</h2>
        <table className="min-w-full bg-white shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-[#2D5990] to-[#00A0E3] text-white">
              <th className="py-4 px-6 border-b">Period</th>
              <th className="py-4 px-6 border-b">Mathematics</th>
              <th className="py-4 px-6 border-b">Physics</th>
              <th className="py-4 px-6 border-b">Chemistry</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(transformedData[branch]).slice(0, 8).map((row, index) => (
              <tr key={index} className="group hover:bg-[#F0F8FF] transition duration-300">
                <td className="py-4 px-6 border-b text-center">{row.period}</td>
                <td className="py-4 px-6 border-b text-center relative">
                  {row.Mathematics.status}
                  <Tooltip tooltipText={row.Mathematics.clusterID} />
                </td>
                <td className="py-4 px-6 border-b text-center relative">
                  {row.Physics.status}
                  <Tooltip tooltipText={row.Physics.clusterID} />
                </td>
                <td className="py-4 px-6 border-b text-center relative">
                  {row.Chemistry.status}
                  <Tooltip tooltipText={row.Chemistry.clusterID} />
                </td>
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
        <label className="ml-8 mr-4 text-xl font-medium text-[#2D5990]">
          Select Batch:
        </label>
        <select
          value={selectedBatch}
          onChange={handleBatchChange}
          className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
        >
          <option value="All">All</option>
          {yearRanges.map((range, index) => (
            <option key={index} value={range}>
              {range}
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
      <div className="overflow-x-auto">
        {selectedBranch === 'All'
          ? Object.keys(transformedData).map((branch) => renderTable(branch))
          : renderTable(selectedBranch)}
      </div>

      /* Modal with Close Button */
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

            <div className="flex items-center space-x-4">
          <label className="ml-8 mr-4 text-xl font-medium text-[#2D5990]">
            Select Batch:
          </label>
          <select
            value={selectedBatch}
            onChange={handleBatchChange}
            className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
          >
            <option value="All">All</option>
            {yearRanges.map((range, index) => (
              <option key={index} value={range}>
            {range}
              </option>
            ))}
          </select>
            </div>

            <button
          className={`w-full bg-[#2D5990] text-white font-medium py-3 px-6 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3] transition-all duration-300 ${
            modalBranch ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          }`}
          disabled={!modalBranch}
          onClick={() => {
            // Implement reassignment logic here
          }}
            >
          Reassign Session
            </button>


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
          </div>
        </Modal>
    </div>
  );
};

export default SessionAndAllotments;
