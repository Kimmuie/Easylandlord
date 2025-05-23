import React from 'react';

const PDFdownload = ({ pdfData, isEditing, handleUpload }) => {
  const handleDownload = () => {
    if (pdfData?.fileName) {
      const cloudName = 'da9cur8vr';
      const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1747298881/${pdfData.fileName}.pdf`;
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="bg-ellWhite xl:h-20 h-22 w-full md:w-4xl xl:w-80 flex flex-row items-center justify-between rounded-l-xl border-2 border-r-0 border-ConstantGray p-2">
      <div className="flex flex-row items-center">
        <img 
          src="/img/pdf-icon.png" 
          width="45" 
          height="60" 
          alt="PDF icon" 
          className="ml-3 cursor-pointer hover:scale-105 active:scale-95" 
          title="Click to download PDF"
        />
        <div className='flex flex-col ml-3 w-full'>
          <span className='text-ellPrimary font-prompt text-md font-semibold'>
            {pdfData?.fileName || "file.pdf"}
          </span>
          <span className='text-ellPrimary font-prompt opacity-80 text-sm'>
            {pdfData?.fileSize ? `${Math.round(pdfData.fileSize / 1024)} KB` : "filesize"}
          </span>
        </div>
      </div>
      {isEditing && (
        <UploadPDF onUploadSuccess={(data) => handleUpload(data, "pdf")}>
          <img 
            src="/img/upload-dark.svg" 
            width="40" 
            height="60" 
            alt="Upload icon" 
            className="p-1 bg-ConstantGray rounded-full mr-3 cursor-pointer hover:scale-105 active:scale-95" 
          />
        </UploadPDF>
      )}
    </div>
  );
};

export default PDFdownload;
