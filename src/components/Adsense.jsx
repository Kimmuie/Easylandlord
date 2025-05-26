import { useEffect } from "react";

const Adsense = ({ pId }) => {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${pId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
      
      console.log("AdSense script loaded"); // Debug log
    } else {
      console.log("AdSense script already exists"); // Debug log
    }
  }, [pId]);

  return null;
};

export default Adsense;