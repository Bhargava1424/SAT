import React, { useRef, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const WeightSignificanceModal = ({ assessment, onClose }) => {
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

  const getChartData = (module) => {
    return {
      labels: module.responses.map(response => response.question),
      datasets: [
        {
          label: 'Weight Significance',
          data: module.responses.map(response => response.weight),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#84EE31',
            '#A0A0A0',
            '#9B66FF',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#84EE31',
            '#A0A0A0',
            '#9B66FF',
          ],
        },
      ],
    };
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto transform transition-transform duration-300 ease-out">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#2D5990]">Weight Significance</h2>
          <button
            onClick={onClose}
            className="text-red-600 font-bold text-2xl hover:text-red-800 transition-colors"
          >
            &times;
          </button>
        </div>
        {assessment.assessment.map((module, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-[#00A0E3]">{module.module}</h3>
            <div style={{ height: '400px' }}>
              <Pie data={getChartData(module)} options={chartOptions} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightSignificanceModal;
