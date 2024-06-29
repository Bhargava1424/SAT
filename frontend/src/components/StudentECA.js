import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StudentECA = () => {
  const { studentName, applicationNumber } = useParams();
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
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [formValid, setFormValid] = useState(false);
  const [eca, setEca] = useState(null); 
  const [editMode, setEditMode] = useState(false);
  const [currentEditingId, setCurrentEditingId] = useState(null); // Define currentEditingId here
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5001/eca/${applicationNumber}`)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setEca(data[0]);
        } else {
          setEca(null);
        }
      })
      .catch(error => console.error('Error:', error));
  }, [applicationNumber]);

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

  const handleLinkChange = (event) => {
    setGoogleDriveLink(event.target.value);
    validateForm();
  };

  const validateForm = () => {
    const allFilled = communicationRating !== null &&
      Object.values(participationRatings).every(rating => rating !== null) &&
      parentFeedback.trim() !== '';
    setFormValid(allFilled);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      studentName,
      applicationNumber,
      communicationRating,
      participationRatings,
      parentFeedback,
      date: new Date().toISOString()
    };

    let url;
    let method;

    if (editMode) {
      url = `http://localhost:5001/eca/${currentEditingId}`; // Use currentEditingId here
      method = 'PATCH';
    } else {
      url = process.env.REACT_APP_BASE_URL + '/eca';
      method = 'POST';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setEca(data);
        navigate('/viewFeedbacks');
      } else {
        throw new Error('Failed to submit ECA data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    resetForm();
  };

  
  const handleEdit = (eca) => {
    setEditMode(true);
    setCurrentEditingId(eca.uuid); // Set the currentEditingId when editing
    setCommunicationRating(eca.communicationRating);
    setParticipationRatings(eca.participationRatings);
    setParentFeedback(eca.parentFeedback);
    setGoogleDriveLink(eca.googleDriveLink);
    validateForm();
  };

  const resetForm = () => {
    setCommunicationRating(null);
    setParticipationRatings({
      indoorSports: null,
      outdoorSports: null,
      music: null,
      artLiterature: null,
      leadershipTeamwork: null,
      debatesActivities: null,
    });
    setParentFeedback('');
    setGoogleDriveLink('');
    setFormValid(false);
    setEditMode(false);
  };

  const getGradientColor = (value) => {
    const hue = (value - 1) * 12;
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Providing ECA feedback for <span className="text-blue-600">{studentName}</span>
        </h1>
        {eca && ( // Only render the form if eca is not null
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
                maxLength="500"
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
        )}

        {/* Display the ECA if it exists */}
        {eca && (
          <div className="mt-2">
            <h2 className="text-xl font-bold mb-4">Current ECA Entry:</h2>
            <div className="p-4 bg-white rounded-lg shadow cursor-pointer">
              <p>Date: {new Date(eca.date).toLocaleDateString()}</p>
              <p>Communication Rating: {eca.communicationRating}</p>
              <p>Parent Feedback: {eca.parentFeedback}</p>
              <div>
                <h4 className="font-bold">Participation Ratings:</h4>
                {Object.entries(eca.participationRatings).map(([key, value]) => (
                  <p key={key}>{`${key}: ${value}`}</p>
                ))}
              </div>
              <div className="flex justify-around mt-4">
                <button onClick={() => handleEdit(eca)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Display a message if no ECA entry exists */}
        {!eca && (
          <p className="mt-4">No ECA entry found for this student.</p>
        )}
      </div>
    </div>
  );
};

export default StudentECA;