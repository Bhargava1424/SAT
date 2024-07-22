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

const AssessmentModal = ({ assessment, onClose }) => {
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('normal'); // Added state for tab control

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

  const calculateModuleAverage = (module) => {
    const totalWeight = module.responses.reduce((sum, response) => sum + response.weight, 0);
    const weightedSum = module.responses.reduce(
      (sum, response) => sum + response.weight * response.answer,
      0
    );
    const totalPossibleScore = module.responses.reduce(
      (sum, response) => sum + response.weight * 10,
      0
    );
    const average = (weightedSum / totalWeight).toFixed(2);
    const scoreTotal = `${weightedSum}/${totalPossibleScore}`;
    return { average, scoreTotal };
  };

  const calculateSessionAverage = (assessment) => {
    const moduleAverages = assessment.assessment.map((module) => {
      const { average } = calculateModuleAverage(module);
      return parseFloat(average) * moduleWeights[module.module];
    });

    const weightedAverage =
      moduleAverages.reduce((sum, avg) => sum + avg, 0) /
      assessment.assessment.reduce((sum, module) => sum + moduleWeights[module.module], 0);

    const totalScore = assessment.assessment.reduce((sum, module) => {
      const { scoreTotal } = calculateModuleAverage(module);
      return sum + parseFloat(scoreTotal.split('/')[0]);
    }, 0);

    const totalPossible = assessment.assessment.reduce((sum, module) => {
      const { scoreTotal } = calculateModuleAverage(module);
      return sum + parseFloat(scoreTotal.split('/')[1]);
    }, 0);

    return {
      weightedAverage: weightedAverage.toFixed(2),
      scoreTotal: `${totalScore}/${totalPossible}`,
    };
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

  const getNormalChartData = (module, subject) => {
    const color = getColorBySubject(subject);
    return {
      labels: module.responses.map((response) => response.keyword),
      datasets: [
        {
          label: 'Maximum Score (10)',
          data: module.responses.map(() => 10),
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          borderColor: 'orange',
          pointBackgroundColor: 'orange',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'orange',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Answer',
          data: module.responses.map((response) => response.answer),
          ...color,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const getWeightedChartData = (module, subject) => {
    const color = getColorBySubject(subject);
    return {
      labels: module.responses.map((response) => response.keyword),
      datasets: [
        {
          label: 'Weight * 10',
          data: module.responses.map((response) => response.weight * 10),
          backgroundColor: 'rgba(255, 165, 0, 0.2)',
          borderColor: 'orange',
          pointBackgroundColor: 'orange',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'orange',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Weight * Answer',
          data: module.responses.map((response) => response.weight * response.answer),
          ...color,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

  const { weightedAverage, scoreTotal } = calculateSessionAverage(assessment);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-[#0d2543] p-4 md:p-6 rounded-lg shadow-lg w-[60%] max-w-7xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">Assessment Details</h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-xl md:text-4xl hover:text-gray-400 transition-colors"
          >
            &times;
          </button>
        </div>
        <p className="mb-4 text-gray-300">
          Date: <strong className="text-[#31c1ff]">{new Date(assessment.date).toLocaleDateString()}</strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Session Period: <strong className="text-[#31c1ff]">{assessment.period}</strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Assessed By: <strong className="text-[#31c1ff]">{assessment.assessedBy} </strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Session Average: <strong className="text-[#31c1ff]">{weightedAverage} ({scoreTotal})</strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Session Subject: <strong className="text-[#31c1ff]">{assessment.subject}</strong> 
        </p>

        <div className="mt-4">
          <div className="flex mb-4 space-x-3 mx-16 ">
            <button
              onClick={() => setActiveTab('normal')}
              className={`flex-1 p-2 text-center rounded-3xl ${activeTab === 'normal' ? 'bg-[#31c1ff] text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Normal Chart
            </button>
            <button
              onClick={() => setActiveTab('weighted')}
              className={`flex-1 p-2 text-center rounded-3xl ${activeTab === 'weighted' ? 'bg-[#31c1ff] text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Weighted Chart
            </button>
          </div>

          {activeTab === 'normal' && (
            <div className="mt-8">
              {assessment.assessment.map((module, index) => {
                const { average, scoreTotal } = calculateModuleAverage(module);
                return (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg md:text-xl underline font-semibold mb-2 text-[#31c1ff]">
                      {module.module} - Average: {average} ({scoreTotal})
                    </h3>
                    <div className="relative mt-4" style={{ width: '100%', height: '600px' }}>
                      <Radar 
                        data={getNormalChartData(module, assessment.subject)} 
                        options={{ 
                          responsive: true, 
                          plugins: {
                            legend: {
                              labels: {
                                color: 'white', // Set the text color for the legend
                              },
                            },
                          },                
                          scales: { 
                            r: { 
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                              },
                              angleLines: {
                                color: 'rgba(255, 255, 255, 0.1)',
                              },
                              pointLabels: {
                                color: 'white',
                                font: {
                                  size: 20,
                                },
                              },
                              ticks: {
                                color: 'white',
                                backdropColor: 'transparent',
                                font: {
                                  size: 20,
                                },
                              },
                            },
                          },
                          maintainAspectRatio: false,
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'weighted' && (
            <div className="mt-8">
              {assessment.assessment.map((module, index) => {
                const { average, scoreTotal } = calculateModuleAverage(module);
                return (
                  <div key={index} className="mb-6">
                    <h3 className="text-lg md:text-xl underline font-semibold mb-2 text-[#31c1ff]">
                      {module.module} - Average: {average} ({scoreTotal})
                    </h3>
                    <div className="relative mt-4" style={{ width: '100%', height: '600px' }}>
                      <Radar 
                        data={getWeightedChartData(module, assessment.subject)} 
                        options={{ 
                          responsive: true, 
                          plugins: {
                            legend: {
                              labels: {
                                color: 'white', // Set the text color for the legend
                              },
                            },
                          },                
                          scales: { 
                            r: { 
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                              },
                              angleLines: {
                                color: 'rgba(255, 255, 255, 0.1)',
                              },
                              pointLabels: {
                                color: 'white',
                                font: {
                                  size: 20,
                                },
                              },
                              ticks: {
                                color: 'white',
                                backdropColor: 'transparent',
                                font: {
                                  size: 20,
                                },
                              },
                            },
                          },
                          maintainAspectRatio: false,
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
