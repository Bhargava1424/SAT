import React, { useRef } from 'react';

const UploadModal = ({ student, closeModal }) => {
    const fileInputRef = useRef(null);

    const handleFileUpload = () => {
        fileInputRef.current.click(); // Simulates click on hidden file input
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        // FormData to append the file to send it via HTTP
        const formData = new FormData();
        formData.append('file', file);
        formData.append('applicationNumber', student.applicationNumber);
    
        // Correct API endpoint where the server handles the file upload
        const uploadUrl = 'http://localhost:5000/upload-to-drive'; 
    
        try {
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('File uploaded successfully:', result);
                alert('File uploaded successfully!');
            } else {
                // Handling server errors or unsuccessful uploads
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file: ' + error.message);
        }
    };
    
    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-3xl relative">
                <button onClick={closeModal} className="absolute top-3 right-3 text-lg text-gray-700 hover:text-red-700">
                    <span><strong>x</strong></span>
                </button>
                <h2 className="text-lg">Upload Photo for <strong>{student.surName} {student.firstName}</strong></h2>
                <div>
                    <p className='m-2'>Application Number: <strong>{student.applicationNumber}</strong></p>
                    <p className='m-2'>Parent Name: <strong>{student.parentName}</strong></p>
                    <p className='m-2'>Phone Number: <strong>{student.primaryContact}</strong></p>
                    <p className='m-2'>Batch: <strong>{student.batch}</strong></p>
                </div>
                <div className="mt-4">
                    <button
                        className="bg-[#00A0E3] text-white px-4 py-2 mr-2 hover:bg-[#008EC3] rounded-2xl"
                        onClick={() => {}}>
                        Open Camera
                    </button>
                    <button
                        className="bg-[#00A0E3] text-white px-4 py-2 hover:bg-[#008EC3] rounded-2xl"
                        onClick={handleFileUpload}>
                        Upload File
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-red-500 text-white hover:bg-red-700 rounded-2xl"
                    onClick={closeModal}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default UploadModal;
