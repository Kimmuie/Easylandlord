"use client"

import React, { useEffect, useState, useContext, useRef } from 'react'
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useParams, useNavigate } from 'react-router-dom';
import ThemeContext from '../contexts/ThemeContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../components/firebase';

// Create a geocoding component that uses the maps libraries properly
const GeocodingComponent = ({ rentals, setRentalsWithCoordinates }) => {
  const [map, setMap] = useState(null);
  const geocodingLibrary = useMapsLibrary("geocoding");
  
  useEffect(() => {
    if (!geocodingLibrary || !rentals || rentals.length === 0) return;
    
    // Now we can safely access the geocoder
    const geocoder = new geocodingLibrary.Geocoder();
    
    // Process each rental location
    const geocodeRentals = async () => {
      const results = await Promise.all(
        rentals.map(async (rental) => {
          try {
            const response = await new Promise((resolve, reject) => {
              geocoder.geocode({ address: rental.location }, (results, status) => {
                if (status === "OK" && results[0]) {
                  const { lat, lng } = results[0].geometry.location;
                  resolve({
                    ...rental,
                    coordinates: {
                      lat: lat(),
                      lng: lng()
                    }
                  });
                } else {
                  console.error(`Geocoding failed for ${rental.location}: ${status}`);
                  resolve({
                    ...rental,
                    coordinates: null
                  });
                }
              });
            });
            return response;
          } catch (error) {
            console.error(`Error geocoding ${rental.location}:`, error);
            return {
              ...rental,
              coordinates: null
            };
          }
        })
      );
      
      setRentalsWithCoordinates(results);
    };
    
    geocodeRentals();
  }, [map, rentals]);
  
  return null; // This component doesn't render anything
};

const GoogleMap = () => {
  const { theme, icons } = useContext(ThemeContext);
  const [currentFilterMap, setCurrentFilterMap] = useState('all');
  const [open, setOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState(null);
  const mapBoxRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(13);
  const markerRefs = useRef({});
  const [rentals, setRentals] = useState([]);
  const [rentalsWithCoordinates, setRentalsWithCoordinates] = useState([]);
  const { rentalId } = useParams();
  const [filteredRentals, setFilteredRentals] = useState([]);
  const [selectedRental, setSelectedRental] = useState(null);
  const markerPosition = { lat: 13.740139342382921, lng: 100.49064271501378 }
  const [userCoordinates, setUserCoordinates] = useState(null);
  const [mapCenter, setMapCenter] = useState(markerPosition);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserCoordinates(coords);
      setMapCenter(coords); // Set initial center
    }, () => {
      // On failure, fallback
      setMapCenter(markerPosition);
    });
  }, []);

  
  useEffect(() => { 
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      console.error("User not logged in");
      return;
    }
    const userDocRef = doc(db, "users", userEmail);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rental) {
          const essentialRentalData = userData.rental.map(rental => ({
            id: rental.id,
            name: rental.name,
            location: rental.location,
            status: rental.status
          }));
          setRentals(essentialRentalData);
        }
      }
    }, (error) => {
      console.error("Error fetching rental data:", error);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSpecificRental = async () => {
      if (!rentalId) return;
      
      const userEmail = localStorage.getItem("email");
      if (!userEmail) return;
      
      try {
        const userDocRef = doc(db, "users", userEmail);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.rental) {
            const currentRental = userData.rental.find(r => r.id === rentalId);
            if (currentRental && currentRental.location) {
              try {
                setSelectedRental({
                  id: currentRental.id,
                  name: currentRental.name,
                  location: currentRental.location,
                  status: currentRental.status
                });
              } catch (error) {
                console.error("Error parsing rental location:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching specific rental:", error);
      }
    };
    
    fetchSpecificRental();
  }, [rentalId]); 

  useEffect(() => {
    let result = [...rentalsWithCoordinates];
    // Status Filter
    if (currentFilterMap === 'all') {
      result = result.filter(rental => rental.status);
    } else if (currentFilterMap === 'available') {
      result = result.filter(rental => rental.status === "available");
    } else if (currentFilterMap === 'unavailable') {
      result = result.filter(rental => rental.status === "unavailable");
    }
    setFilteredRentals(result);
  }, [currentFilterMap, rentalsWithCoordinates]);

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

  const handleMarkerClick = (rentalId) => {
    setSelectedRentalId(rentalId);
    setOpen(true);
  };

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
              onClick={() => setMapCenter(userCoordinates)}>
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
              mapId={icons.mapId}
              options={{disableDefaultUI: true}}>
                
            <GeocodingComponent 
              rentals={rentals} 
              setRentalsWithCoordinates={setRentalsWithCoordinates} 
            />
              <AdvancedMarker position={userCoordinates}>
                <Pin 
                  background={"#FF0000"} 
                  glyphColor={"#F7F7F7"} 
                  scale={1.5}
                />
              </AdvancedMarker>
            {filteredRentals.map((rental) => (
              rental.coordinates && (
                <React.Fragment key={rental.id}>
                  <AdvancedMarker 
                    ref={(el) => markerRefs.current[rental.id] = el}
                    position={rental.coordinates}
                    onClick={() => handleMarkerClick(rental.id)}
                  >
                    <Pin 
                      background={"#FFFFFF"} 
                      borderColor={rental.status === "available" ? "#00FF00" : "#FF0000"} 
                      glyphColor={rental.status === "available" ? "#00FF00" : "#FF0000"} 
                      glyph="⬤"
                      scale={1.5}
                    />
                  </AdvancedMarker>
                  
                  {open && selectedRentalId === rental.id && (
                    <InfoWindow anchor={markerRefs.current[rental.id]}>
                      <div className='flex justify-center items-center flex-col' ref={mapBoxRef}>
                        <img src="./img/sampleImage.jpg" width="100" height="40" alt="image" className="border-2 border-ellGray rounded-md mt-4"/>
                        <h3 className="font-bold font-prompt">{rental.name}</h3>
                        <button className="mt-1 flex flex-row bg-[#333333] rounded-full items-center justify-center font-prompt text-[#F7F7F7] h-6 px-2 w-full text-xs cursor-pointer active:scale-98">
                          ดูรายละเอียด
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </React.Fragment>
              )
            ))}
          </Map>
        </div>
      </APIProvider>
    </div>
  )
}

export default GoogleMap