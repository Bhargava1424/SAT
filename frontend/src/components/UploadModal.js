// uploadModal.js

import React, { useState } from 'react';

const UploadModal = ({ onClose, onLinkSubmitted }) => {
  const [link, setLink] = useState('');

  const handleLinkChange = (event) => {
    setLink(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onLinkSubmitted(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded max-h-screen overflow-auto">
        <h2 className="text-lg font-bold mb-4">Paste Google Drive Link</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={link}
            onChange={handleLinkChange}
            className="w-full p-2 border rounded bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste Google Drive link here (make sure it's public)"
          />
          <button type="submit" className="mt-4 p-2 bg-[#2D5990] text-white rounded">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;