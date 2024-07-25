import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import profileImage from '../assets/profile.jpg';

const modules = [
  {
    title: 'Classroom Behavior',
    questions: [
      { weight: 1, question: 'How disciplined is the student during class?' },
      { weight: 0.9, question: 'How active is the student in class participation?' },
      { weight: 0.9, question: 'How punctual is the student in completing homework?' },
      { weight: 0.7, question: 'How attentive is the student during class?' },
      { weight: 0.4, question: 'How well does the student respond during class?' },
      { weight: 0.2, question: 'How well does the student maintain notes for your subject?' },
    ],
  },
  {
    title: 'Study Hour Behavior',
    extraItem: 'Please consider the following when evaluating the student\'s study hour behavior:',
    questions: [
      { weight: 0.7, question: 'How frequently does the student approach you with questions?' },
      { weight: 0.7, question: 'How efficient is the student in completing work during sessions?' },
      { weight: 0.9, question: 'How focused is the student during study hours?' },
      { weight: 1, question: 'How often does the student disturb others in the name of discussions during study hours?' },
    ],
  },
  {
    title: 'Examination Behavior',
    extraItem: 'Please consider the following when evaluating the student\'s examination behavior:',
    questions: [
      { weight: 0.8, question: 'How disciplined/attentive is the student during exams?' },
      { weight: 1, question: 'How enthusiastic is the student about clearing doubts after exams?' },
      { weight: 0.9, question: 'How focused and determined is the student in finishing exams till the end?' },
    ],
  },
  {
    title: 'Miscellaneous',
    questions: [
      { weight: 1, question: 'How good is the student’s behavior with fellow students?' },
      { weight: 1, question: 'How good is the student’s behavior with teaching and non-teaching staff during study hours/break times?' },
      { weight: 0.1, question: 'How punctual is the student after short breaks?' },
    ],
  },
];


const checkIfAssessmentExists = async (applicationNumber, sessionId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/assessments/${applicationNumber}/${sessionId}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

const fetchStudentPhoto = async (applicationNumber) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/students/photo/${applicationNumber}`);
    // Check if the student.photo is google drive link
        // if data is not null, then check if the photo is google drive link
    let photo = response.data.photo;
    if (photo && photo.includes('drive')) {
      try{
        const linkId = photo.split('/d/')[1].split('/view')[0];
        photo = `https://drive.google.com/thumbnail?id=${linkId}`;
      } catch (error) {
        photo = "";
      }
    }
    return photo;
  } catch (error) {
    return null;
  }
};

const StudentAssessment = () => {
  const { name, sessionId, applicationNumber, assessmentId } = useParams();
  const [responses, setResponses] = useState(modules.map(module => module.questions.map(() => null)));
  const [assessmentExists, setAssessmentExists] = useState(false);
  const [existingAssessmentId, setExistingAssessmentId] = useState(null);
  const [subject, setSubject] = useState('');
  const [photo, setPhoto] = useState(null); // New state for student photo

  useEffect(() => {
    const fetchAssessment = async () => {
      if (assessmentId) {
        const assessment = await checkIfAssessmentExists(applicationNumber, sessionId);
        if (assessment) {
          const initialResponses = modules.map((module, moduleIndex) =>
            module.questions.map((question, questionIndex) => 
              assessment.assessment[moduleIndex]?.responses[questionIndex]?.answer || null
            )
          );
          setResponses(initialResponses);
          setAssessmentExists(true);
          setExistingAssessmentId(assessment._id); // Set the existing assessment ID
        }
      }
    };

    const fetchPhoto = async () => {
      const pic = await fetchStudentPhoto(applicationNumber);
      setPhoto(pic); // Set the student photo
      if(pic==null) {
        setPhoto(profileImage)
      }
    };

    fetchAssessment();
    fetchPhoto(); // Fetch the student photo

    const subjectFromSession = sessionStorage.getItem('subject');
    if (subjectFromSession) {
      setSubject(subjectFromSession);
    }
  }, [applicationNumber, sessionId, assessmentId]);

  const handleOptionChange = (moduleIndex, questionIndex, value) => {
    const newResponses = [...responses];
    newResponses[moduleIndex][questionIndex] = value;
    setResponses(newResponses);
  };

  const isAllAnswered = () => {
    return responses.every(module => module.every(response => response !== null));
  };

  const saveResponses = async () => {
    const teacher = sessionStorage.getItem('name');
    const payload = modules.map((module, moduleIndex) => ({
      module: module.title,
      responses: module.questions.map((question, questionIndex) => ({
        question: question.question,
        weight: question.weight,
        answer: responses[moduleIndex][questionIndex],
      })),
    }));

    try {
      if (assessmentExists && existingAssessmentId) {
        const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/assessments/${existingAssessmentId}`, {
          assessment: payload,
          teacher,
          sessionId,
          applicationNumber,
          subject,
        });
        console.log(response.data);
      } else {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/assessments`, {
          assessment: payload,
          teacher,
          sessionId,
          applicationNumber,
          subject,
        });
        console.log(response.data);
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleSubmit = () => {
    if (isAllAnswered()) {
      saveResponses();
      alert('Assessment Submitted');
      window.location.href = '/pendingSessions';
    } else {
      alert('Please answer all the questions in all modules.');
    }
  };

  const getGradientColor = (value) => {
    const hue = (value - 1) * 12;
    return `hsl(${hue}, 100%, 50%)`;
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Providing assessment for <span className="text-[#00A0E3]">{name}</span>
        </h1>
        {photo && (
          <div className="text-center mb-8">
            <img src={photo} alt={profileImage} className=" h-80 rounded-2xl mx-auto shadow-lg object-cover" />
          </div>
        )}
        {assessmentExists && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
            <p className="font-bold">Assessment Completed</p>
            <p>
              Assessment for {name} is completed and saved. This is the View & Edit page. Please make sure to submit
              after making changes!
            </p>
            <p><strong>Assessment ID:</strong> {existingAssessmentId}</p>
          </div>
        )}
        {modules.map((module, moduleIndex) => (
          <div key={moduleIndex} className="mb-12">
            <h2 className="text-2xl font-bold mb-4">{module.title}</h2>
            {module.extraItem && <p className="text-gray-600 mb-4">{module.extraItem}</p>}
            {module.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="mb-8">
                <p className="text-lg font-semibold mb-4">{question.question}</p>
                <div className="flex justify-between bg-gray-100 rounded-lg p-4">
                  {[...Array(10).keys()].map(i => (
                    <label
                      key={i}
                      className={`px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                        responses[moduleIndex][questionIndex] === i + 1
                          ? 'text-white shadow-lg transform scale-110'
                          : 'bg-white text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: responses[moduleIndex][questionIndex] === i + 1 ? getGradientColor(i + 1) : '',
                      }}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`module-${moduleIndex}-question-${questionIndex}`}
                        value={i + 1}
                        checked={responses[moduleIndex][questionIndex] === i + 1}
                        onChange={() => handleOptionChange(moduleIndex, questionIndex, i + 1)}
                      />
                      {i + 1}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#2D5990] text-white rounded hover:bg-[#00A0E3] font-bold py-2 px-4 transition-colors duration-200"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default StudentAssessment;