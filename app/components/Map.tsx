'use client';
import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const map_center_madrid = {
  lat: 40.416775,
  lng: -3.703790,
};

const MapComponent: React.FC = () => {
  const [markers, setMarkers] = useState<GeocodedLocation[]>([]);
  
  const addresses = [
    '6 Calle de las Infantas, Madrid, Spain',
    'Plaza Mayor, Madrid, Spain',
    'Retiro Park, Madrid, Spain',
    'Royal Palace of Madrid, Madrid, Spain',
  ];

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    if (isLoaded) {
      geocodeAddresses(addresses);
    }
  }, [isLoaded]);

  // Geocoding function to convert addresses to coordinates
  const geocodeAddresses = async (addresses: string[]) => {
    const geocoder = new google.maps.Geocoder();
    const geocodedLocations: GeocodedLocation[] = [];

    for (const address of addresses) {
      try {
        const result = await geocodeAddress(geocoder, address);
        geocodedLocations.push({
          lat: result.lat(),
          lng: result.lng(),
          address,
        });
      } catch (error) {
        console.error('Geocode failed: ', error);
      }
    }
    setMarkers(geocodedLocations);
  };

  // Helper function for geocoding a single address
  const geocodeAddress = (geocoder: google.maps.Geocoder, address: string): Promise<google.maps.LatLng> => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].geometry.location);
        } else {
          reject(status);
        }
      });
    });
  };

  return (
    <>
      {isLoaded ? (
        <GoogleMap mapContainerStyle={mapContainerStyle} center={map_center_madrid} zoom={13}>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.address}
            />
          ))}
        </GoogleMap>
      ) : (
        <div>Loading</div>
      )}
    </>
  );
};

export default MapComponent;