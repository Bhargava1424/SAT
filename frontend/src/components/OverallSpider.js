import React, { useRef, useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const moduleWeights = {
  'Classroom Behavior': 0.9,
  'Study Hour Behavior': 0.8,
  'Examination Behavior': 0.4,
  'Miscellaneous': 0.6,
};

const OverallSpider = ({ assessments, applicationNumber, onClose }) => {
  const modalRef = useRef(null);
  const [selectedSubjects, setSelectedSubjects] = useState(['All']);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('remarks');

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/feedbacks/${applicationNumber}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, [applicationNumber]);

  const handleSubjectChange = (subject) => {
    if (subject === 'All') {
      setSelectedSubjects(['All']);
    } else {
      const newSelectedSubjects = selectedSubjects.includes(subject)
        ? selectedSubjects.filter((s) => s !== subject)
        : [...selectedSubjects, subject];

      if (newSelectedSubjects.length === 3) {
        setSelectedSubjects(['All']);
      } else {
        setSelectedSubjects(newSelectedSubjects.filter((s) => s !== 'All'));
      }
    }
  };

  const calculateModuleAverage = (responses) => {
    const totalWeight = responses.reduce((sum, response) => sum + response.weight, 0);
    const weightedSum = responses.reduce(
      (sum, response) => sum + response.weight * response.answer,
      0
    );
    return (weightedSum / totalWeight).toFixed(2);
  };

  const getModuleAverages = (assessments) => {
    const modules = ['Classroom Behavior', 'Study Hour Behavior', 'Examination Behavior', 'Miscellaneous'];
    const moduleAverages = { overall: 0, modules: {} };

    modules.forEach((module) => {
      const responses = assessments
        .flatMap((assessment) => assessment.assessment)
        .filter((m) => m.module === module)
        .flatMap((m) => m.responses);

      moduleAverages.modules[module] = parseFloat(calculateModuleAverage(responses));
    });

    moduleAverages.overall = (
      Object.values(moduleAverages.modules).reduce((sum, avg) => sum + avg, 0) /
      modules.length
    ).toFixed(2);

    return moduleAverages;
  };

  const getColorBySubject = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physics':
        return {
          backgroundColor: 'rgba(0, 255, 0, 0.2)',
          borderColor: 'green',
          pointBackgroundColor: 'green',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'green',
        };
      case 'chemistry':
        return {
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          borderColor: 'blue',
          pointBackgroundColor: 'blue',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'blue',
        };
      case 'mathematics':
        return {
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          borderColor: 'red',
          pointBackgroundColor: 'red',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'red',
        };
      default:
        return {
          backgroundColor: 'rgba(255, 69, 0, 0.2)',
          borderColor: '#FF4500',
          pointBackgroundColor: '#FF4500',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#FF4500',
        };
    }
  };

  const getChartData = (assessments) => {
    const mathAssessments = assessments.filter((a) => a.subject === 'Mathematics');
    const chemistryAssessments = assessments.filter((a) => a.subject === 'Chemistry');
    const physicsAssessments = assessments.filter((a) => a.subject === 'Physics');

    const mathAverages = getModuleAverages(mathAssessments);
    const chemistryAverages = getModuleAverages(chemistryAssessments);
    const physicsAverages = getModuleAverages(physicsAssessments);

    const datasets = [];

    if (selectedSubjects.includes('All') || selectedSubjects.includes('Mathematics')) {
      datasets.push({
        label: 'Mathematics',
        data: [
          mathAverages.modules['Classroom Behavior'],
          mathAverages.modules['Study Hour Behavior'],
          mathAverages.modules['Examination Behavior'],
          mathAverages.modules['Miscellaneous'],
          mathAverages.overall,
        ],
        ...getColorBySubject('Mathematics'),
      });
    }

    if (selectedSubjects.includes('All') || selectedSubjects.includes('Chemistry')) {
      datasets.push({
        label: 'Chemistry',
        data: [
          chemistryAverages.modules['Classroom Behavior'],
          chemistryAverages.modules['Study Hour Behavior'],
          chemistryAverages.modules['Examination Behavior'],
          chemistryAverages.modules['Miscellaneous'],
          chemistryAverages.overall,
        ],
        ...getColorBySubject('Chemistry'),
      });
    }

    if (selectedSubjects.includes('All') || selectedSubjects.includes('Physics')) {
      datasets.push({
        label: 'Physics',
        data: [
          physicsAverages.modules['Classroom Behavior'],
          physicsAverages.modules['Study Hour Behavior'],
          physicsAverages.modules['Examination Behavior'],
          physicsAverages.modules['Miscellaneous'],
          physicsAverages.overall,
        ],
        ...getColorBySubject('Physics'),
      });
    }

    datasets.push({
      label: 'Max Limit',
      data: [10, 10, 10, 10, 10],
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 255, 255, 0.5)',
    });

    return {
      labels: ['Classroom Behavior', 'Study Hour Behavior', 'Examination Behavior', 'Miscellaneous', 'Overall'],
      datasets,
    };
  };

  const renderRemarksTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Session Period</th>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Given By</th>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Remark</th>
        </tr>
      </thead>
      <tbody>
        {assessments.map((assessment) => (
          <tr key={assessment._id}>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{new Date(assessment.date).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{assessment.assessedBy}</td>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{assessment.assessment.find(module => module.module === 'Miscellaneous')?.remarks || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFeedbackTable = () => (
    <table className="min-w-full bg-white mt-8">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Date</th>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Reviewer</th>
          <th className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-gray-800 text-left text-sm uppercase font-semibold">Feedback</th>
        </tr>
      </thead>
      <tbody>
        {feedbacks.map((feedback) => (
          <tr key={feedback.feedbackId}>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{new Date(feedback.date).toLocaleDateString()}</td>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{feedback.reviewer}</td>
            <td className="py-2 px-4 border-b border-gray-200 text-sm">{feedback.feedback}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const chartData = getChartData(assessments);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-[#0d2543] p-4 md:p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-2xl font-bold text-white">Overall Assessment Spider Chart</h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-2xl md:text-4xl hover:text-gray-400 transition-colors"
          >
            &times;
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-center space-x-4 mb-4">
            {['All', 'Mathematics', 'Chemistry', 'Physics'].map((subject) => (
              <label key={subject} className="inline-flex items-center text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  className="form-checkbox h-5 w-5 text-[#31c1ff] border-gray-300 rounded focus:ring-0 focus:outline-none"
                />
                <span className="ml-2">{subject}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-center" style={{ width: '100%', height: '500px' }}>
            <div className="relative" style={{ width: '80%', height: '100%' }}>
              <Radar
                data={chartData}
                options={{
                  responsive: true,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  scales: {
                    r: {
                      beginAtZero: true,
                      suggestedMax: 10,
                      ticks: {
                        max: 10,
                        min: 0,
                        stepSize: 2,
                        color: '#fff',
                        backdropColor: 'transparent',
                      },
                      pointLabels: {
                        font: {
                          size: 10,
                        },
                        color: '#fff',
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#fff',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className="mt-8">
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 font-semibold text-sm rounded-md ${
                  activeTab === 'remarks' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('remarks')}
              >
                Faculty Remarks
              </button>
              <button
                className={`px-4 py-2 font-semibold text-sm rounded-md ${
                  activeTab === 'feedback' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => setActiveTab('feedback')}
              >
                Feedback
              </button>
            </div>
            <div className="mt-4">
              {activeTab === 'remarks' && renderRemarksTable()}
              {activeTab === 'feedback' && renderFeedbackTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallSpider;
