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
          backgroundColor: 'rgba(255, 69, 0, 0.2)',
          borderColor: '#FF4500',
          pointBackgroundColor: '#FF4500',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#FF4500',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  };

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
        <p className="mb-2 text-gray-300">
          Date: <strong className="text-[#31c1ff]">{new Date(assessment.date).toLocaleDateString()}</strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Assessed By: <strong className="text-[#31c1ff]">{assessment.assessedBy} </strong> 
        </p>
        <p className="mb-4 text-gray-300">
          Session Average: <strong className="text-[#31c1ff]">{calculateModuleAverage({ responses: assessment.assessment.flatMap(module => module.responses) })}</strong> 
        </p>

        <div className='mt-8'>
          {assessment.assessment.map((module, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-lg md:text-xl underline font-semibold mb-2 text-[#31c1ff]">
                {module.module} - Average: {calculateModuleAverage(module)}
              </h3>
              <div className="relative mt-4" style={{ width: '100%', height: '600px' }}>
                <Radar 
                  data={getChartData(module)} 
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;
