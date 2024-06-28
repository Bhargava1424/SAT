import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';

const StudentReport = () => {
  const { applicationNumber } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/assessments/${applicationNumber}`);
      const data = await response.json();
      setAssessments(data);
    } catch (err) {
      setError('Error fetching assessments: ' + err.message);
    }
  };

  const calculateAverages = (assessments) => {
    const averageScores = assessments.map((assessment) => {
      const scores = Object.values(assessment.assessment).map(
        ({ answer, weight }) => (answer / 10) * weight
      );
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return { date: assessment.date, averageScore };
    });
    return averageScores;
  };

  const averageScores = calculateAverages(assessments);

  const chartData = {
    labels: averageScores.map((score) => new Date(score.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Assessment Score',
        data: averageScores.map((score) => score.averageScore),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Student Report for {applicationNumber}</h2>
      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default StudentReport;
