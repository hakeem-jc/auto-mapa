'use client';
import React from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";

const MapComponent: React.FC = () => {
  const defaultCoordinates = { lat: 40.416775, lng: -3.703790 }; // Coordinates of Madrid
  const center: google.maps.LatLngLiteral = defaultCoordinates; 

  const [_map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = (mapInstance: google.maps.Map) => setMap(mapInstance);

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
    >
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        zoom={10}
        center={center}
        onLoad={onLoad}
      />
    </LoadScript>
  );
};

export default MapComponent;