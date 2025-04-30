"use client"

import React, { useEffect, useState, useContext, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import ThemeContext from '../contexts/ThemeContext';

const GoogleMap = () => {
  const { theme, icons } = useContext(ThemeContext);
  const markerPosition = { lat: 13.740139342382921, lng: 100.49064271501378 }
  const [currentFilterMap, setCurrentFilterMap] = useState('all');
  const [mapCenter, setMapCenter] = useState(markerPosition);
  const [open, setOpen] = useState(false);
  const mapBoxRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(13);
  const markerRef = useRef(null);

  useEffect(() => {
      function handleClickOutside(event) {
          if (mapBoxRef.current && !mapBoxRef.current.contains(event.target)) {
            setOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, []);

  // Handle map movement
  const handleCenterChanged = (e) => {
    if (e && e.detail && e.detail.center) {
      setMapCenter(e.detail.center);
    }
  };
  
  const handleFilterMap = (filter) => {
    setCurrentFilterMap(filter);
  };

  const getFixedIconPath = (iconPath) => {
    return iconPath ? iconPath.replace(/^\./, '') : '';
  };

  const iconTarget = getFixedIconPath(icons.target);

  return (
    <div className="absolute w-full h-full bg-white flex justify-center">
      <div className='absolute z-10 inset-0 flex flex-row h-min ml-4 pointer-events-none'>
        <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary pointer-events-auto ${currentFilterMap === 'all' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer bg-ellWhite"}`}
                onClick={() => handleFilterMap("all")}>ทั้งหมด</button>
        <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center pointer-events-auto ${currentFilterMap === 'unavailable' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer bg-ellWhite"}`}
                onClick={() => handleFilterMap("unavailable")}>
            <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellRed mr-2"></div>
            ไม่ว่าง
        </button>
        <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 w-25 md:w-22 font-prompt text-ellPrimary flex flex-row justify-center items-center pointer-events-auto ${currentFilterMap === 'available' ? 'bg-ellPrimary text-ellTertiary border-transparent cursor-default' : "cursor-pointer bg-ellWhite"}`}
                onClick={() => handleFilterMap("available")}>
            <div className="rounded-full border-2 border-ellGray h-5 w-5 bg-ellGreen mr-2"></div>
            ว่าง
        </button>
      </div>
      <div className='absolute z-10 inset-0 flex justify-end h-min right-4 pointer-events-none'>
        <button className={`mt-4.5 border-2 border-ellGray hover:border-ellPrimary rounded-2xl py-2 mr-2 px-2 bg-ellWhite cursor-pointer pointer-events-auto`}
              onClick={() => handleFilterMap("all")}>
          <img src={iconTarget} width="30" height="40" alt="target"/>
        </button>
      </div>
      <APIProvider apiKey={import.meta.env.VITE_GoogleMap_API}>
        <div className="h-full w-full">
          <Map 
              zoom={mapZoom}
              center={mapCenter} 
              onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
              onCenterChanged={handleCenterChanged}
              gestureHandling="greedy"
              mapId= {icons.mapId}
              options={{disableDefaultUI: true}}>                
            <AdvancedMarker 
              ref={markerRef}
              position={markerPosition} 
              onClick={() => setOpen(true)}
              >
              <Pin 
                background={"#FFFFFF"} 
                glyphColor={"#FF0000"} 
                glyph="⬤"
                scale={1.5}
              />
            </AdvancedMarker>
            
            {open && (
              <InfoWindow anchor={markerRef.current}>
                <div className='flex justify-center items-center flex-col' ref={mapBoxRef}>
                  <img src="./img/sampleImage.jpg" width="100" height="40" alt="image" className="border-2 border-ellGray rounded-md mt-4"/>
                  <h3 className="font-bold font-prompt">Location</h3>
                  <button className="mt-1 flex flex-row bg-[#333333] rounded-full items-center justify-center font-prompt text-[#F7F7F7] h-6 px-2 w-full text-xs cursor-pointer active:scale-98">
                    ดูรายละเอียด
                  </button>
                </div>
              </InfoWindow>
            )}
          </Map>
        </div>
      </APIProvider>
    </div>
  )
}
export default GoogleMap