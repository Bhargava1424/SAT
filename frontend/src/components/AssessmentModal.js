import React, { useRef, useEffect } from 'react';
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

const AssessmentModal = ({ assessment, onClose }) => {
  const modalRef = useRef(null);

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
    return (weightedSum / totalWeight).toFixed(2);
  };

  const getChartData = (module) => {
    return {
      labels: module.responses.map((response) => response.keyword),
      datasets: [
        {
          label: 'Weight * 10',
          data: module.responses.map((response) => response.weight * 10),
          backgroundColor: 'rgba(34, 202, 236, 0.2)',
          borderColor: '#00A0E3',
          pointBackgroundColor: '#00A0E3',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00A0E3',
          pointRadius: 5, // Adjust this value to make the dot bigger
          pointHoverRadius: 7, // Adjust this value to make the dot bigger
        },
        {
          label: 'Weight * Answer',
          data: module.responses.map((response) => response.weight * response.answer),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: '#FF6384',
          pointBackgroundColor: '#FF6384',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#FF6384',
          pointRadius: 5, // Adjust this value to make the dot bigger
          pointHoverRadius: 7, // Adjust this value to make the dot bigger
        },
      ],
    };
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#2D5990]">Assessment Details</h2>
          <button
            onClick={onClose}
            className="text-red-600 font-bold text-xl md:text-4xl hover:text-red-800 transition-colors"
          >
            &times;
          </button>
        </div>
        <p className="mb-2 text-gray-700">
          <strong className="text-[#2D5990]">Date:</strong> {new Date(assessment.date).toLocaleDateString()}
        </p>
        <p className="mb-4 text-gray-700">
          <strong className="text-[#2D5990]">Assessed By:</strong> {assessment.assessedBy}
        </p>
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-[#2D5990]">Summary of Modules</h3>
          <ul className="list-disc list-inside text-gray-700">
            {assessment.assessment.map((module, index) => (
              <li key={index}>
                <span className="font-semibold">{module.module}</span> - Average: {calculateModuleAverage(module)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          {assessment.assessment.map((module, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-[#00A0E3]">
                {module.module} - Average: {calculateModuleAverage(module)}
              </h3>
              <Radar 
                data={getChartData(module)} 
                options={{ 
                  responsive: true, 
                  scales: { 
                    r: { 
                      beginAtZero: true,
                      pointLabels: {
                        font: {
                          size: 16,
                        },
                      },
                      ticks: {
                        font: {
                          size: 16,
                        },
                      },
                    },
                  },
                }} 
              />

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
