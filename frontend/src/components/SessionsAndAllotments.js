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

  
  const role = sessionStorage.getItem('role');
  const userBranch = sessionStorage.getItem('branch');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL + '/branches');
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches data', error);
      }
    };

    fetchBranches();
  }, []);


  // Use the role to filter branches and sessions
  const filteredBranches = role === 'director' ? branches.filter(branch => branch.branchCode === userBranch) : branches;


  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BASE_URL + '/sessions');
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
      <div key={branch} className="mb-12 bg-gray-200 md:mx-4 md:p-6 p-1 rounded-lg shadow-lg overflow-x-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-[#2D5990]">
          {branch === 'All' ? 'All Branches' : branch}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-collapse shadow-lg rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#2D5990] text-white">
                <th className="py-4 px-6 border-b-2 font-semibold">Period</th>
                {[...branchTeachers].map((teacher, index) => (
                  <th key={index} className="py-4 px-6 border-b-2 font-semibold">
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
                    periodIncludesStartDate(period) ? 'bg-[#00A0E3]' : 'hover:bg-[#F0F8FF]'
                  }`}
                >
                  <td className="py-4 px-6 border-b text-center font-medium whitespace-nowrap">
                    {period}
                  </td>
                  {[...branchTeachers].map((teacher, teacherIndex) => {
                    const session = sortedSessionsByTeacher[teacher]?.find(
                      (session) => session.period === period
                    );
                    return (
                      <td
                        key={teacherIndex}
                        className={`py-4 px-6 border-b text-center cursor-pointer transition duration-200 transform hover:scale-110 whitespace-nowrap ${
                          session ? '' : 'bg-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedClusterID(session?.clusterID);
                          setSelectedSessionID(session?._id);
  
                          setIsStudentListModalOpen(true);
                        }}
                        title={
                          session
                            ? `Cluster ID: ${session.clusterID}\nBranch: ${session.branch}\nStatus: ${session.status}`
                            : 'N/A'
                        }
                      >
                        {session ? (
                          <div className="space-y-1">
                            <p className={`px-2 py-1 rounded-lg ${
                              session.status === 'pending' ? 'bg-red-200 text-red-700' :
                              session.status === 'completed' ? 'bg-green-200 text-green-700' :
                              session.status === 'upcoming' ? 'bg-gray-200 text-gray-700' : ''
                            }`}>
                              <strong>Status:</strong> {session.status}
                            </p>
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
    <div className="container pb-8 mx-auto px-4 sm:px-6 lg:px-8">
      <Navbar />
      <h1 className="text-3xl sm:text-4xl font-bold my-8 text-center text-[#2D5990]">
        Sessions and Allotments
      </h1>
      <div className="my-6 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
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
            {filteredBranches.map((branch) => (
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

      {role === 'director'
        ? renderSessionsTable(userBranch)
        : (selectedBranch === 'All' 
            ? filteredBranches.map((branch) => renderSessionsTable(branch.branchCode))
            : renderSessionsTable(selectedBranch)
          )
      }

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
