import React, { useRef, useEffect, useState } from 'react';
import { Radar } from 'react-chartjs-2';
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

const OverallSpider = ({ assessments, onClose }) => {
  const modalRef = useRef(null);
  const [selectedSubjects, setSelectedSubjects] = useState(['All']);

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
          mathAverages.overall, // overall stays the same
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
          chemistryAverages.overall, // overall stays the same
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
          physicsAverages.overall, // overall stays the same
        ],
        ...getColorBySubject('Physics'),
      });
    }

    datasets.push({
      label: 'Max Limit',
      data: [10, 10, 10, 10, 10], // overall stays 10
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

  const chartData = getChartData(assessments);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-[#0d2543] p-4 md:p-6 rounded-lg shadow-lg w-[60%] max-w-7xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">Overall Assessment Spider Chart</h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-xl md:text-4xl hover:text-gray-400 transition-colors"
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
          <div className="flex justify-center" style={{ width: '100%', height: '800px' }}>
            <div className="relative" style={{ width: '80%', height: '800px' }}>
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
                          size: 14,
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
        </div>
      </div>
    </div>
  );
};

export default OverallSpider;
