'use client';
import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";

interface Location {
  address: string;
  position: google.maps.LatLngLiteral;
}

const MapComponent: React.FC = () => {
  const defaultCoordinates = { lat: 40.416775, lng: -3.703790 }; // Coordinates of Madrid
  const [locations, setLocations] = useState<Location[]>([]);

  const addresses = [
    '6 Calle de las Infantas, Madrid, Spain',
    'Plaza Mayor, Madrid, Spain',
    'Retiro Park, Madrid, Spain',
    'Royal Palace of Madrid, Madrid, Spain'
  ];

  useEffect(() => {
    const url = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_API_URL;
    console.log(url);
    console.log(process.env.VERCEL_URL);
    console.log(process.env.VERCEL_ENV);


    const geocodeAddresses = async () => {
      const geocoder = new google.maps.Geocoder();
      const geocodedLocations = await Promise.all(
        addresses.map((address) => 
          new Promise<Location>((resolve, reject) => {
            geocoder.geocode({ address }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const { lat, lng } = results[0].geometry.location.toJSON();
                resolve({ address, position: { lat, lng } });
              } else {
                reject(new Error(`Geocoding failed for address ${address}`));
              }
            });
          })
        )
      );
      setLocations(geocodedLocations);
    };

    if (window.google) {
      geocodeAddresses();
    }
  }, []);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={12}
        center={defaultCoordinates}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location.position}
            title={location.address}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;