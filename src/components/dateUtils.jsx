// dateUtils.js
export const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
                         "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

// Convert Date object to Thai Buddhist format (d/m/y)
export const formatToThaiBuddhist = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543; // Convert to Buddhist Era
  return `${d} ${m} ${y}`;
};

// Format date as ISO string for storage (YYYY-MM-DD)
export const formatForStorage = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse an ISO date string and return a formatted Thai Buddhist date string
export const formatIsoToThaiBuddhist = (isoString) => {
  if (!isoString) return '';
  return formatToThaiBuddhist(new Date(isoString));
};

// Custom formatter for Flatpickr
export const flatpickrThaiBuddhistFormatter = (date, format) => {
  if (format === "j M Y") {
    return formatToThaiBuddhist(date);
  }
  // Default to flatpickr's built-in formatting
  return flatpickr.formatDate(date, format);
};