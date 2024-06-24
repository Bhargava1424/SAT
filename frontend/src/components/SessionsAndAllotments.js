// SessionAndAllotments.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar';
import Modal from './Modal';

const SessionAndAllotments = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
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

        const periodsSet = new Set();
        const teachersSet = new Set();
        response.data.forEach((session) => {
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

  const renderSessionsTable = (branch) => {
    const branchSessions = branch === 'All' ? sessions : sessions.filter((session) => session.branch === branch);
    const branchPeriods = new Set(branchSessions.map((session) => session.period));
    const branchTeachers = new Set(branchSessions.map((session) => session.teacher));

    return (
      <div key={branch} className="mb-12">
        <h2 className="text-2xl font-bold my-4 text-center text-[#2D5990]">
          {branch === 'All' ? 'All Branches' : branch}
        </h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Period</th>
              {[...branchTeachers].map((teacher, index) => (
                <th key={index} className="py-2 px-4 border">
                  {teacher}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...branchPeriods].map((period, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border">{period}</td>
                {[...branchTeachers].map((teacher, teacherIndex) => {
                  const session = branchSessions.find(
                    (session) => session.period === period && session.teacher === teacher
                  );
                  return (
                    <td key={teacherIndex} className="py-2 px-4 border">
                      {session ? (
                        <>
                          <p>Cluster ID: {session.clusterID}</p>
                          <p>Branch: {session.branch}</p>
                          <p>Status: {session.status}</p>
                        </>
                      ) : (
                        'N/A'
                      )}
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

      {selectedBranch === 'All' ? branches.map((branch) => renderSessionsTable(branch.branchCode)) : renderSessionsTable(selectedBranch)}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} branches={branches} />
    </div>
  );
};

export default SessionAndAllotments;
