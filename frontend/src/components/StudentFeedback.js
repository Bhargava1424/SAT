import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const StudentFeedback = () => {
  const { studentName } = useParams();
  const [communicationRating, setCommunicationRating] = useState(null);
  const [participationRatings, setParticipationRatings] = useState({
    indoorSports: null,
    outdoorSports: null,
    music: null,
    artLiterature: null,
    leadershipTeamwork: null,
    debatesActivities: null,
  });
  const [parentFeedback, setParentFeedback] = useState('');
  const [formValid, setFormValid] = useState(false);

  const handleRatingChange = (event, category) => {
    const value = parseInt(event.target.value, 10);
    if (category) {
      setParticipationRatings(prevRatings => ({ ...prevRatings, [category]: value }));
    } else {
      setCommunicationRating(value);
    }
    validateForm();
  };

  const handleFeedbackChange = (event) => {
    setParentFeedback(event.target.value);
    validateForm();
  };

  const validateForm = () => {
    const allFilled = communicationRating !== null &&
      Object.values(participationRatings).every(rating => rating !== null) &&
      parentFeedback.trim() !== '';
    setFormValid(allFilled);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      communicationRating,
      participationRatings,
      parentFeedback,
    };
    console.log(payload);
  };

  const getGradientColor = (value) => {
    const hue = (value - 1) * 12; // Scale value from 1-10 to 0-240 for hue (red to green)
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Providing feedback for <span className="text-blue-600">{studentName}</span>
        </h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <p className="text-lg font-semibold mb-4">
              How well does the student communicate off-topic in and outside the class during activities, debates, quizzes, sports days, etc.?
            </p>
            <div className="flex justify-between bg-gray-100 rounded-lg p-4">
              {[...Array(10)].map((_, index) => (
                <label
                  key={index}
                  className={`px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    communicationRating === index + 1
                      ? 'text-white shadow-lg transform scale-110'
                      : 'bg-white text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: communicationRating === index + 1 ? getGradientColor(index + 1) : '',
                  }}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    name="communicationRating"
                    value={index + 1}
                    checked={communicationRating === index + 1}
                    onChange={handleRatingChange}
                  />
                  {index + 1}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-lg font-semibold mb-4">Rate the student's participation in the following areas:</p>
            {Object.keys(participationRatings).map((category, index) => (
              <div key={index} className="mb-8">
                <p className="text-lg font-semibold mb-4 capitalize">{category.replace(/([A-Z])/g, ' $1').toLowerCase()}:</p>
                <div className="flex justify-between bg-gray-100 rounded-lg p-4">
                  {[...Array(10)].map((_, index) => (
                    <label
                      key={index}
                      className={`px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        participationRatings[category] === index + 1
                          ? 'text-white shadow-lg transform scale-110'
                          : 'bg-white text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: participationRatings[category] === index + 1 ? getGradientColor(index + 1) : '',
                      }}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={category}
                        value={index + 1}
                        checked={participationRatings[category] === index + 1}
                        onChange={(e) => handleRatingChange(e, category)}
                      />
                      {index + 1}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <label htmlFor="parentFeedback" className="block text-lg font-semibold mb-2">Parent Feedback:</label>
            <textarea
              id="parentFeedback"
              value={parentFeedback}
              onChange={handleFeedbackChange}
              maxLength="50"
              className="w-full p-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter verdict after speaking with parents..."
            />
          </div>

          <button
            type="submit"
            disabled={!formValid}
            className="w-full bg-[#2D5990] text-white rounded hover:bg-[#00A0E3] font-bold py-2 px-4 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentFeedback;