import React, { useRef, useState } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';

const UploadImage = ({ onUploadSuccess, children, multiple = false }) => {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.8,         
      maxWidthOrHeight: 1024, 
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const uploadSingleImage = async (file) => {
    const compressedFile = await compressImage(file);
    const data = new FormData();
    data.append('file', compressedFile);
    data.append('upload_preset', 'Easylandlord');

    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/da9cur8vr/image/upload',
      data
    );
    return res.data.secure_url;
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (multiple) {
        // Handle multiple files
        const uploadPromises = files.map(async (file, index) => {
          try {
            const imageUrl = await uploadSingleImage(file);
            // Update progress
            setUploadProgress(((index + 1) / files.length) * 100);
            return { success: true, url: imageUrl, file: file.name };
          } catch (error) {
            console.error(`Upload failed for ${file.name}:`, error);
            return { success: false, error: error.message, file: file.name };
          }
        });

        const results = await Promise.all(uploadPromises);
        
        // Call onUploadSuccess for each successful upload
        results.forEach(result => {
          if (result.success) {
            onUploadSuccess(result.url);
          }
        });

        // Log summary
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        console.log(`Upload complete: ${successful} successful, ${failed} failed`);
        
        if (failed > 0) {
          const failedFiles = results.filter(r => !r.success).map(r => r.file);
          console.warn('Failed uploads:', failedFiles);
        }
      } else {
        // Handle single file (original behavior)
        const file = files[0];
        const imageUrl = await uploadSingleImage(file);
        onUploadSuccess(imageUrl);
        setUploadProgress(100);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset the input
      e.target.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleUpload}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      <div
        onClick={() => inputRef.current.click()}
        className={`cursor-pointer inline-flex items-center justify-center relative ${
          uploading ? 'opacity-75 pointer-events-none' : ''
        }`}
      >
        {uploading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-sm">
              {multiple ? `Uploading... ${Math.round(uploadProgress)}%` : 'Uploading...'}
            </span>
          </div>
        ) : (
          children || "Upload Image"
        )}
      </div>
    </>
  );
};

export default UploadImage;