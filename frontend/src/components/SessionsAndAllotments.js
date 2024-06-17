import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Navbar from './Navbar';

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
      <h1 className="text-4xl font-bold my-8 text-center text-[#2D5990]">Sessions and Allotments</h1>
      <div className="my-6 flex justify-center items-center">
        <label className="mr-4 text-xl font-medium text-[#2D5990]">Select Start Date:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
        />
        <label className="ml-8 mr-4 text-xl font-medium text-[#2D5990]">Select Branch:</label>
        <select
          value={selectedBranch}
          onChange={handleBranchChange}
          className="border-2 border-[#00A0E3] bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00A0E3]"
        >
          <option value="All">All</option>
          {Object.keys(transformedData).map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        {selectedBranch === 'All'
          ? Object.keys(transformedData).map((branch) => renderTable(branch))
          : renderTable(selectedBranch)}
      </div>
    </div>
  );
};

export default SessionAndAllotments;