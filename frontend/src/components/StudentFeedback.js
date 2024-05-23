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
  console.log(studentName);

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

  return (
    <div className='bg-gray-400 rounded-3xl m-1 md:mx-6 p-4' >
      <h2 className="text-xl font-bold mb-4">Giving Feedback for {studentName}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-xl">
            How well does the student communicate off-topic in and outside the class during activities, debates, quizzes, sports days, etc.?
          </label>
          <div className="flex space-x-2 text-lg">
            {[...Array(10)].map((_, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="communicationRating"
                  value={index + 1}
                  onChange={handleRatingChange}
                />
                 {index + 1}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xl">Rate the student’s participation in the following areas:</label>
          {Object.keys(participationRatings).map((category, index) => (
            <div key={index} className="mb-2">
              <label className="block mb-1 capitalize">{category.replace(/([A-Z])/g, ' $1').toLowerCase()}:</label>
              <div className="flex space-x-2 text-lg">
                {[...Array(10)].map((_, index) => (
                  <label key={index}>
                    <input
                      type="radio"
                      name={category}
                      value={index + 1}
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
          <label className="block mb-2 text-xl">Parent Feedback:</label>
          <textarea
            value={parentFeedback}
            onChange={handleFeedbackChange}
            maxLength="50"
            className="w-full p-2 border rounded bg-gray-200"
            placeholder="Enter verdict after speaking with parents..."
          />
        </div>

        <button
          type="submit"
          disabled={!formValid}
          className={`p-2 rounded ${formValid ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default StudentFeedback;
