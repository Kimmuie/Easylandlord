import React, { useEffect, useRef } from 'react'

const Adbanner = () => {
  const adRef = useRef(null);

    useEffect(() => {
    if (window.adsbygoogle && adRef.current) {
        try {
        window.adsbygoogle.push({});
        } catch (e) {
        console.error("Ad push failed", e);
        }
    }
    }, []);
    
useEffect(() => {
  if (!window.adsbygoogle) {
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    script.async = true;
    script.setAttribute("data-ad-client", "ca-pub-5656951196117843");
    document.head.appendChild(script);
  }
}, []);


  return (
    <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5656951196117843"
        data-ad-slot="2654056216"
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={adRef}
    ></ins>
  )
}

export default Adbanner