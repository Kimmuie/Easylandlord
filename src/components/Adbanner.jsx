import React, { useEffect, useRef } from 'react';

const Adbanner = ({ 
  dataAdSlot = "2654056216", 
  dataAdFormat = "auto",
  dataAdClient = "ca-pub-5656951196117843",
  style = { display: "block", backgroundColor: "#f0f0f0" }
}) => {
  const adRef = useRef(null);
  const hasTriedToLoad = useRef(false);

  useEffect(() => {
    const loadAd = () => {
      if (window.adsbygoogle && adRef.current && !hasTriedToLoad.current) {
        try {
          hasTriedToLoad.current = true;
          console.log("Pushing ad to AdSense"); // Debug log
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("AdSense ad failed to load:", e);
          hasTriedToLoad.current = false;
        }
      } else if (!window.adsbygoogle) {
        console.log("AdSense not loaded yet, waiting..."); // Debug log
      }
    };

    // Try to load ad immediately if script is ready
    if (window.adsbygoogle) {
      loadAd();
    }

    // Also try after a delay to ensure script is fully loaded
    const timer = setTimeout(() => {
      loadAd();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ border: "1px dashed #ccc", padding: "10px" }}>
      <div style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>
        AdSense Ad Slot: {dataAdSlot}
      </div>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={dataAdClient}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive="false"
        ref={adRef}
      />
    </div>
  );
};

export default Adbanner;