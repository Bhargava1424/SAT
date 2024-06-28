import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar';
import Modal from './Modal';
import StudentListModal from './StudentListModal';
import { format, parse, isAfter, compareAsc, isSameDay, isBefore } from 'date-fns';

const SessionAndAllotments = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
  const [selectedClusterID, setSelectedClusterID] = useState(null);
  const [selectedSessionID, setSelectedSessionID] = useState(null);


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

        const teachersSet = new Set();
        response.data.forEach((session) => {
          teachersSet.add(session.teacher);
        });

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

  const filterAndSortSessions = (branchSessions) => {
    const sessionsByTeacher = {};

    branchSessions.forEach((session) => {
      if (!sessionsByTeacher[session.teacher]) {
        sessionsByTeacher[session.teacher] = [];
      }
      sessionsByTeacher[session.teacher].push(session);
    });

    const filteredSortedSessions = {};

    Object.keys(sessionsByTeacher).forEach((teacher) => {
      const teacherSessions = sessionsByTeacher[teacher];

      const beforeSessions = teacherSessions.filter((session) => {
        const [startPeriod] = session.period.split(' - ');
        const sessionStartDate = parse(startPeriod, 'MMM d, yyyy', new Date());
        return isBefore(sessionStartDate, startDate);
      }).sort((a, b) => {
        const [startPeriodA] = a.period.split(' - ');
        const [startPeriodB] = b.period.split(' - ');
        const sessionStartDateA = parse(startPeriodA, 'MMM d, yyyy', new Date());
        const sessionStartDateB = parse(startPeriodB, 'MMM d, yyyy', new Date());
        return compareAsc(sessionStartDateA, sessionStartDateB);
      }).slice(-4);

      const afterSessions = teacherSessions.filter((session) => {
        const [startPeriod] = session.period.split(' - ');
        const sessionStartDate = parse(startPeriod, 'MMM d, yyyy', new Date());
        return isSameDay(sessionStartDate, startDate) || isAfter(sessionStartDate, startDate);
      }).sort((a, b) => {
        const [startPeriodA] = a.period.split(' - ');
        const [startPeriodB] = b.period.split(' - ');
        const sessionStartDateA = parse(startPeriodA, 'MMM d, yyyy', new Date());
        const sessionStartDateB = parse(startPeriodB, 'MMM d, yyyy', new Date());
        return compareAsc(sessionStartDateA, sessionStartDateB);
      }).slice(0, 3);

      filteredSortedSessions[teacher] = [...beforeSessions, ...afterSessions];
    });

    return filteredSortedSessions;
  };

  const renderSessionsTable = (branch) => {
    const branchSessions = branch === 'All' ? sessions : sessions.filter((session) => session.branch === branch);
    const sortedSessionsByTeacher = filterAndSortSessions(branchSessions);

    const branchTeachers = new Set(branchSessions.map((session) => session.teacher));
    const branchPeriods = Array.from(new Set(Object.values(sortedSessionsByTeacher).flat().map(session => session.period))).slice(0, 7);

    return (
      <div key={branch} className="mb-12">
        <h2 className="text-2xl font-bold my-4 text-center text-[#2D5990]">
          {branch === 'All' ? 'All Branches' : branch}
        </h2>
        <table className="min-w-full bg-white border border-collapse shadow-lg rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-[#00A0E3] text-white">
              <th className="py-4 px-6 border-b font-semibold">Period</th>
              {[...branchTeachers].map((teacher, index) => (
                <th key={index} className="py-4 px-6 border-b font-semibold">
                  {teacher}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchPeriods.map((period, index) => (
              <tr
                key={index}
                className={`transition duration-300 ${
                  periodIncludesStartDate(period) ? 'bg-green-100' : 'hover:bg-gray-100'
                }`}
              >
                <td className="py-4 px-6 border-b text-center font-medium">{period}</td>
                {[...branchTeachers].map((teacher, teacherIndex) => {
                  const session = sortedSessionsByTeacher[teacher]?.find(
                    (session) => session.period === period
                  );
                  return (
                    <td
                      key={teacherIndex}
                      className={`py-4 px-6 border-b text-center cursor-pointer transition duration-300 transform hover:scale-105`}
                      onClick={() => {
                        setSelectedClusterID(session?.clusterID);
                        setSelectedSessionID(session?._id);

                        setIsStudentListModalOpen(true);
                      }}
                      title={session ? `Cluster ID: ${session.clusterID}\nBranch: ${session.branch}\nStatus: ${session.status}` : 'N/A'}
                    >
                      {session ? (
                        <div>
                          <p><strong>session ID:</strong> {session._id}</p>
                          <p><strong>Cluster ID:</strong> {session.clusterID}</p>
                          <p><strong>Branch:</strong> {session.branch}</p>
                          <p><strong>Status:</strong> {session.status}</p>
                        </div>
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

  const periodIncludesStartDate = (period) => {
    const [startPeriod, endPeriod] = period.split(' - ');
    const sessionStartDate = parse(startPeriod, 'MMM d, yyyy', new Date());
    const sessionEndDate = parse(endPeriod, 'MMM d, yyyy', new Date());
    return isSameDay(sessionStartDate, startDate) || (isBefore(sessionStartDate, startDate) && isAfter(sessionEndDate, startDate));
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    alert('Reassignment successful!');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 pb-8">
      <Navbar />
      <h1 className="text-4xl font-bold my-8 text-center text-[#2D5990]">
        Sessions and Allotments
      </h1>
      <div className="my-6 flex justify-center items-center space-x-8">
        <div className="flex items-center space-x-2">
          <label className="text-xl font-medium text-[#2D5990]">Select Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-xl font-medium text-[#2D5990]">Select Branch:</label>
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
        </div>
        <button
          className="bg-[#2D5990] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#00A0E3] focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
          onClick={() => setIsModalOpen(true)}
        >
          Manage Sessions
        </button>
      </div>

      {selectedBranch === 'All'
        ? branches.map((branch) => renderSessionsTable(branch.branchCode))
        : renderSessionsTable(selectedBranch)}

      <Modal
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        branches={branches}
        onSuccess={handleSuccess}
      />
      <StudentListModal
        isOpen={isStudentListModalOpen}
        onClose={() => setIsStudentListModalOpen(false)}
        clusterID={selectedClusterID}
        sessionID={selectedSessionID}
      />
    </div>
  );
};

export default SessionAndAllotments;