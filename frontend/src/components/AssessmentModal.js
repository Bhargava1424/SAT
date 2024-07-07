
import React, { useRef, useEffect } from 'react';

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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#2D5990]">Assessment Details</h2>
          <button
            onClick={onClose}
            className="text-red-600 font-bold text-2xl hover:text-red-800 transition-colors"
          >
            &times;
          </button>
        </div>
        <p className="mb-2 text-gray-700"><strong className="text-[#2D5990]">Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
        <p className="mb-4 text-gray-700"><strong className="text-[#2D5990]">Assessed By:</strong> {assessment.assessedBy}</p>
        <div>
          {assessment.assessment.map((module, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold mb-2 text-[#2D5990]">{module.module} - Average: {calculateModuleAverage(module)}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {module.responses.map((response, idx) => (
                  <li key={idx}>
                    <strong className="text-[#2D5990]">{response.question}</strong>: {response.answer} (Weight: {response.weight})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentModal;