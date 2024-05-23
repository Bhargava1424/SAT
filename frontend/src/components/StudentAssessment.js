import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const modules = [
    {
        title: 'Classroom Behavior',
        questions: [
            'How disciplined is the student during class?',
            'How active is the student in class participation?',
            'How punctual is the student in completing homework?',
            'How attentive is the student during class?',
            'How well does the student respond during class?',
            'How well does the student maintain notes for your subject?'
        ]
    },
    {
        title: 'Study Hour Behavior',
        extraItem: 'Please consider the following when evaluating the student’s study hour behavior:',
        questions: [
            'How frequently does the student approach you with questions?',
            'How efficient is the student in completing work during sessions?',
            'How focused is the student during study hours?',
            'How often does the student disturb others in the name of discussions during study hours?'
        ]
    },
    {
        title: 'Examination Behavior',
        extraItem: 'Please consider the following when evaluating the student’s examination behavior:',
        questions: [
            'How disciplined/attentive is the student during exams?',
            'How enthusiastic is the student about clearing doubts after exams?',
            'How focused and determined is the student in finishing exams till the end?'
        ]
    }
];

// Dummy function to check if assessment already exists for a student
const checkIfAssessmentExists = (name) => {
    // Replace this with actual API call logic
    return name === 'Alice Johnson'; // Example: return true for Alice Johnson
};

const StudentAssessment = () => {
    const { name } = useParams();
    const [responses, setResponses] = useState(modules.map(module => module.questions.map(() => null)));
    const [assessmentExists, setAssessmentExists] = useState(false);

    useEffect(() => {
        const exists = checkIfAssessmentExists(name);
        setAssessmentExists(exists);
    }, [name]);

    const handleOptionChange = (moduleIndex, questionIndex, value) => {
        const newResponses = [...responses];
        newResponses[moduleIndex][questionIndex] = value;
        setResponses(newResponses);
    };

    const isAllAnswered = () => {
        return responses.every(module => module.every(response => response !== null));
    };

    const handleSubmit = () => {
        if (assessmentExists) {
            alert('Assessment has already been submitted.');
            return;
        }

        if (isAllAnswered()) {
            const payload = modules.map((module, moduleIndex) => ({
                module: module.title,
                responses: module.questions.map((question, questionIndex) => ({
                    question,
                    answer: responses[moduleIndex][questionIndex]
                }))
            }));
            alert('Assessment Submitted');
            console.log(payload);
            window.location.href = '/dashboard';
        } else {
            alert('Please answer all the questions in all modules.');
        }
    };

    return (
        <div className='bg-gray-400 rounded-3xl m-1 md:mx-6'>
            <div className="flex flex-col gap-8 p-4 md:p-8">
                <h1 className="text-xl font-bold text-center">Providing assessment for {name}</h1>
                {assessmentExists && (
                    <div className="text-center text-red-500 font-bold mb-4">
                        Assessment for {name} is Completed and Saved. This is the View & Edit page. Please make sure to submit after making changes!
                    </div>
                )}
                {modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="border p-4 rounded-lg w-full md:w-3/4 mx-auto">
                        <h2 className="text-lg md:text-xl font-bold mb-2">{module.title}</h2>
                        {module.extraItem && <p className="mb-4 text-sm md:text-lg font-semibold">{module.extraItem}</p>}
                        {module.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="mb-2 text-base md:text-lg">
                                <p className="mb-2">{question}</p>
                                <div className="grid grid-cols-5 gap-1 md:flex md:justify-between">
                                    {[...Array(10).keys()].map(i => (
                                        <label key={i} className={`px-1 py-1 md:px-4 md:py-2 border rounded cursor-pointer ${responses[moduleIndex][questionIndex] === i + 1 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                            <input
                                                type="radio"
                                                className="hidden"
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
                <button onClick={handleSubmit} className="w-1/2 md:w-1/4 mx-auto px-2 py-2 bg-[#2D5990] text-white rounded hover:bg-[#00A0E3]">Submit</button>
            </div>
        </div>
    );
};

export default StudentAssessment;
