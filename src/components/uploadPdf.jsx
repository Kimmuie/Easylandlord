import React, { useRef } from 'react';
import axios from 'axios';

const UploadPDF = ({ onUploadSuccess, children }) => {
  const inputRef = useRef();

  const handleUpload = async (e) => {
    const pdfFile = e.target.files[0];
    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("upload_preset", "Easylandlord");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/da9cur8vr/upload",
        formData,
        {
          params: {
            resource_type: "raw",
            public_id: pdfFile.name 
          }
        }
      );
    const downloadUrl = res.data.secure_url.replace('/upload/', '/upload/fl_attachment/');
    onUploadSuccess({
        url: downloadUrl,
        fileName: pdfFile.name,
        fileSize: pdfFile.size,
        publicId: res.data.public_id,
        viewUrl: res.data.secure_url 
      });
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
        <>
      <input
        type="file"
        accept="application/pdf"
        ref={inputRef}
        onChange={handleUpload}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => inputRef.current.click()}
        className={`cursor-pointer inline-flex items-center justify-center relative`}
      >
        {children || "Upload PDF"}
      </div>
    </>
  );
};

export default UploadPDF;
