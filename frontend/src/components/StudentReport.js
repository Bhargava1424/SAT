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
import OverallSpider from './OverallSpider';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const moduleWeights = {
  'Classroom Behavior': 0.9,
  'Study Hour Behavior': 0.8,
  'Examination Behavior': 0.4,
  'Miscellaneous': 0.6,
};

const StudentReport = () => {
  const { applicationNumber } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [studentDetails, setStudentDetails] = useState(null);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showWeightSignificance, setShowWeightSignificance] = useState(false);

  useEffect(() => {
    const getKeyword = (question) => {
      const keywords = {
        "How disciplined is the student during class?": "Discipline",
        "How active is the student in class participation?": "Participation",
        "How punctual is the student in completing homework?": "Punctuality",
        "How attentive is the student during class?": "Attentiveness",
        "How well does the student respond during class?": "Response",
        "How well does the student maintain notes for your subject?": "Notes",
        "How frequently does the student approach you with questions?": "Questions",
        "How efficient is the student in completing work during sessions?": "Efficiency",
        "How focused is the student during study hours?": "Focus",
        "How often does the student disturb others in the name of discussions during study hours?": "Disturbance",
        "How disciplined/attentive is the student during exams?": "Exam Discipline",
        "How enthusiastic is the student about clearing doubts after exams?": "Doubts",
        "How focused and determined is the student in finishing exams till the end?": "Exam Focus",
        "How good is the student’s behavior with fellow students?": "Peer Behavior",
        "How good is the student’s behavior with teaching and non-teaching staff during study hours/break times?": "Staff Behavior",
        "How punctual is the student after short breaks?": "Break Punctuality",
      };

      return keywords[question] || "Unknown";
    };

    const fetchAssessments = async () => {
      try {
        const response = await fetch(
          process.env.REACT_APP_BASE_URL + `/assessments/${applicationNumber}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'An error occurred while fetching data');
        }

        data.forEach((assessment) => {
          assessment.assessment.forEach((module) => {
            module.responses.forEach((response) => {
              response.keyword = getKeyword(response.question);
            });
          });
        });

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

  const calculateModuleAverage = (module) => {
    const totalWeight = module.responses.reduce((sum, response) => sum + response.weight, 0);
    const weightedSum = module.responses.reduce(
      (sum, response) => sum + response.weight * response.answer,
      0
    );
    const average = (weightedSum / totalWeight).toFixed(2);
    const scoreTotal = `${weightedSum.toFixed(2)}/${(10 * totalWeight).toFixed(2)}`;
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

  const sessionAverages = assessments.map((assessment) => {
    const { weightedAverage } = calculateSessionAverage(assessment);
    const session = sessions.find((session) => session._id === assessment.sessionId);
    return { period: session ? session.period : assessment.sessionId, average: parseFloat(weightedAverage) };
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

  const handleClick = (event, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const selectedAssessment = assessments[index];
      const session = sessions.find((session) => session._id === selectedAssessment.sessionId);
      setSelectedAssessment({ ...selectedAssessment, period: session ? session.period : selectedAssessment.sessionId });
    }
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
    onClick: handleClick
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
              <div
                className="inline-block px-4 py-2 md:px-6 md:py-3 bg-[#00A0E3] text-white text-lg md:text-xl font-bold rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={handleWeightSignificanceClick}
              >
                Overall : {overallAverage}/10
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full md:p-4 md:mb-4">
              <Line data={data} options={options} />
            </div>
            {selectedAssessment && (
              <AssessmentModal
                assessment={selectedAssessment}
                onClose={() => setSelectedAssessment(null)}
              />
            )}
            {showWeightSignificance && (
              <OverallSpider
                assessments={assessments}
                applicationNumber={applicationNumber}
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
