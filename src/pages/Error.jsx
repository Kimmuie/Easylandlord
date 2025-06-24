import React, { useEffect, useRef } from 'react';

const NotFound = () => {
  const particlesRef = useRef(null);

  useEffect(() => {
    // Create floating particles
    const createParticle = () => {
      if (!particlesRef.current) return;
      
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-white bg-opacity-60 rounded-full animate-particle-float';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 5) + 's';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particlesRef.current.appendChild(particle);

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 8000);
    };

    // Create particles continuously
    const particleInterval = setInterval(createParticle, 300);

    // Add interactive mouse effects
    const handleMouseMove = (e) => {
      const mouseX = e.clientX / window.innerWidth;
      const mouseY = e.clientY / window.innerHeight;
      
      document.body.style.background = `linear-gradient(${135 + mouseX * 90}deg, 
        hsl(${230 + mouseX * 50}, 70%, ${60 + mouseY * 20}%) 0%, 
        hsl(${260 + mouseY * 50}, 70%, ${50 + mouseX * 20}%) 100%)`;
    };

    // Add click ripple effect
    const handleClick = (e) => {
      const ripple = document.createElement('div');
      ripple.className = 'fixed w-5 h-5 bg-white bg-opacity-60 rounded-full pointer-events-none animate-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      ripple.style.transform = 'translate(-50%, -50%)';
      document.body.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.remove();
        }
      }, 600);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      clearInterval(particleInterval);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      // Reset background
      document.body.style.background = '';
    };
  }, []);
  return (
    <>
      <style>{`
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          overflow: hidden;
        }

        .text-gradient {
          background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease-in-out infinite;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .glitch {
          position: relative;
        }

        .glitch::before,
        .glitch::after {
          content: '404';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glitch::before {
          animation: glitch-1 0.5s infinite;
        }

        .glitch::after {
          animation: glitch-2 0.5s infinite;
        }

        @keyframes glitch-1 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes glitch-2 {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(2px, -2px); }
          40% { transform: translate(2px, 2px); }
          60% { transform: translate(-2px, -2px); }
          80% { transform: translate(-2px, 2px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delay-1 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 0s;
        }

        .animate-float-delay-2 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-float-delay-3 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 4s;
        }

        .animate-float-delay-4 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes particle-float {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-10vh) translateX(100px);
            opacity: 0;
          }
        }

        .animate-particle-float {
          animation: particle-float 8s linear infinite;
        }

        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }

        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }

        .backdrop-blur-glass {
          backdrop-filter: blur(10px);
        }
      `}</style>

      {/* Floating geometric elements */}
      <div className="absolute top-1/5 left-1/10 w-15 h-15 bg-white bg-opacity-10 rounded-full opacity-10 animate-float-delay-1" />
      <div className="absolute top-3/5 right-1/6 w-10 h-10 bg-white bg-opacity-10 opacity-10 animate-float-delay-2 transform rotate-45" />
      <div className="absolute bottom-1/5 left-1/5 w-20 h-20 bg-white bg-opacity-10 opacity-10 animate-float-delay-3 rounded-2xl" />
      <div 
        className="absolute top-1/3 right-1/3 w-8 h-8 bg-white bg-opacity-10 opacity-10 animate-float-delay-4"
        style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      />

      {/* Particle system */}

      <div className="flex justify-center items-center text-center text-ellBlack z-10 relative">
        <div className="px-8">
          <div className="text-gradient glitch font-black my-18 text-9xl" style={{ textShadow: '0 0 50px rgba(255, 255, 255, 0.3)' }}>
            404
          </div>
          <h1 className="font-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)'}}>
            Oops! Page Not Found
          </h1>
          <p className="opacity-90 max-w-2xl mx-auto leading-relaxed mb-8 px-4 " style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
            The page you're looking for seems to have vanished into the digital void. 
            Don't worry though – even the best explorers sometimes take a wrong turn!
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFound;