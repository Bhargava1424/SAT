import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AssessmentModal from './AssessmentModal';
import WeightSignificanceModal from './WeightSignificanceModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentReport = () => {
  const { applicationNumber } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showWeightSignificance, setShowWeightSignificance] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BASE_URL + `/assessments/${applicationNumber}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'An error occurred while fetching data');
        }
        setAssessments(data);
        const sessionIds = data.map((assessment) => assessment.sessionId);
        fetchSessions(sessionIds);
      } catch (error) {
        setError('Error fetching assessments: ' + error.message);
      }
    };

    const fetchStudentDetails = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BASE_URL +
            `/students/applicationNumber/${applicationNumber}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'An error occurred while fetching student details');
        }
        setStudentDetails(data);
      } catch (error) {
        setError('Error fetching student details: ' + error.message);
      }
    };

    const fetchSessions = async (sessionIds) => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BASE_URL + `/sessions/byIds`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionIds }),
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'An error occurred while fetching sessions');
        }
        setSessions(data);
      } catch (error) {
        setError('Error fetching sessions: ' + error.message);
      }
    };

    fetchAssessments();
    fetchStudentDetails();
  }, [applicationNumber]);

  if (error) return <div className="text-red-600 text-center mt-4">{error}</div>;

  const calculateWeightedAverage = (responses) => {
    const totalWeight = responses.reduce((sum, response) => sum + response.weight, 0);
    const weightedSum = responses.reduce(
      (sum, response) => sum + response.weight * response.answer,
      0
    );
    return (weightedSum / totalWeight).toFixed(2);
  };

  const sessionAverages = assessments.map((assessment) => {
    const allResponses = assessment.assessment.flatMap((module) => module.responses);
    const average = calculateWeightedAverage(allResponses);
    const session = sessions.find((session) => session._id === assessment.sessionId);
    return { period: session ? session.period : assessment.sessionId, average: parseFloat(average) };
  });

  const overallAverage = (
    sessionAverages.reduce((sum, session) => sum + session.average, 0) /
    sessionAverages.length
  ).toFixed(2);

  const data = {
    labels: sessionAverages.map((sa) => sa.period),
    datasets: [
      {
        label: 'Session Averages',
        data: sessionAverages.map((sa) => sa.average),
        borderColor: '#2D5990',
        backgroundColor: '#00A0E3',
        fill: false,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Session Period',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Average Score',
        },
        min: 0,
        max: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Session Averages',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelectedAssessment(assessments[index]);
      }
    },
  };

  const handleWeightSignificanceClick = () => {
    setShowWeightSignificance(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center my-4 md:my-6 text-[#2D5990]">
          Report of{' '}
          <span className="text-[#00A0E3]">
            {studentDetails ? `${studentDetails.firstName} ${studentDetails.surName}` : 'Loading...'}
          </span>
        </h2>
        {studentDetails ? (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-4 md:mb-6 flex flex-col md:flex-row justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg md:text-xl font-bold text-[#2D5990]">Student Details</h3>
              <p className="text-gray-700">
                <strong className="text-[#2D5990]">Student Name:</strong>{' '}
                <span className="text-[#00A0E3] font-bold">{studentDetails.firstName} {studentDetails.surName}</span>
              </p>
              <p className="text-gray-700">
                <strong className="text-[#2D5990]">Application Number:</strong>{' '}
                <span className="text-[#00A0E3] font-bold">{studentDetails.applicationNumber}</span>
              </p>
              <p className="text-gray-700">
                <strong className="text-[#2D5990]">Batch:</strong>{' '}
                <span className="text-[#00A0E3] font-bold">{studentDetails.batch}</span>
              </p>
            </div>
            {studentDetails.attendance && (
              <div>
                <h3 className="text-lg md:text-xl font-bold text-[#2D5990]">Attendance</h3>
                <p className="text-gray-700">
                  <strong className="text-[#2D5990]">FN:</strong>{' '}
                  <span className="text-[#00A0E3] font-bold">{studentDetails.attendance.fnTotal}</span>
                </p>
                <p className="text-gray-700">
                  <strong className="text-[#2D5990]">AN:</strong>{' '}
                  <span className="text-[#00A0E3] font-bold">{studentDetails.attendance.anTotal}</span>
                </p>
                <p className="text-gray-700">
                  <strong className="text-[#2D5990]">Exams:</strong>{' '}
                  <span className="text-[#00A0E3] font-bold">{studentDetails.attendance.exams}</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-700">Loading student details...</p>
        )}
        {assessments.length === 0 ? (
          <p className="text-center text-gray-700">No assessments found for this student.</p>
        ) : (
          <div>
            <div className="text-center mb-4 md:mb-6">
              <p
                className="text-lg md:text-xl font-bold cursor-pointer text-[#00A0E3] hover:underline"
                onClick={handleWeightSignificanceClick}
              >
                Overall Average: {overallAverage}
              </p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mb-4 md:mb-6">
              <Line data={data} options={options} />
            </div>
            {selectedAssessment && (
              <AssessmentModal
                assessment={selectedAssessment}
                onClose={() => setSelectedAssessment(null)}
              />
            )}
            {showWeightSignificance && (
              <WeightSignificanceModal
                assessment={assessments[0]} // Pass the first assessment to display weights
                onClose={() => setShowWeightSignificance(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReport;
