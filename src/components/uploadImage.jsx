import React, { useRef } from 'react';
import axios from 'axios';

const UploadImage = ({ onUploadSuccess, children }) => {
  const inputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Easylandlord');

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/da9cur8vr/image/upload',
        data
      );
      const imageUrl = res.data.secure_url;
      onUploadSuccess(imageUrl);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => inputRef.current.click()}
        className={`cursor-pointer inline-flex items-center justify-center relative`}
      >
        {children || "Upload Image"}
      </div>
    </>
  );
};

export default UploadImage;
