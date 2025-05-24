import { useEffect } from "react";

const Adsense = ({ pId }) => {
  useEffect(() => {
    const existingScript = document.querySelector(
      `script[src*="adsbygoogle.js?client=ca-pub-${pId}"]`
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [pId]);

  return null;
};

export default Adsense;
