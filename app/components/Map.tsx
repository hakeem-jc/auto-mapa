"use client";
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import Loader from "@/app/components/Loader";
import { Subasta } from "@/app/interfaces";

interface GeocodedLocation {
  title: string;
  lat: number;
  lng: number;
  address: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const map_center_madrid = {
  lat: 40.416775,
  lng: -3.70379,
};

interface MapInterface {
  addresses:Subasta[];
}

const MapComponent: React.FC<MapInterface> = ({ addresses }) => {
  const [markers, setMarkers] = useState<GeocodedLocation[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<GeocodedLocation | null>(
    null
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (isLoaded && addresses) {
      geocodeAddresses(addresses);
    }
  }, [isLoaded, addresses]);

  // Geocoding function to convert addresses to coordinates
  const geocodeAddresses = async (addresses: Subasta[]) => {
    const geocoder = new google.maps.Geocoder();
    const geocodedLocations: GeocodedLocation[] = [];

    for (const address of addresses) {
      try {
        const result = await geocodeAddress(geocoder, address);
        geocodedLocations.push({
          title: address.name + ": " + address.location,
          lat: result.lat(),
          lng: result.lng(),
          address: address.location,
        });
      } catch (error) {
        console.error("Geocode failed: ", error);
      }
    }
    setMarkers(geocodedLocations);
  };

  // Helper function for geocoding a single address
  const geocodeAddress = (
    geocoder: google.maps.Geocoder,
    address: Subasta
  ): Promise<google.maps.LatLng> => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address.location }, (results, status) => {
        if (status === "OK" && results && results[0]) {
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
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={map_center_madrid}
          zoom={13}
        >
          {markers.map((marker, index) => (
            <Marker
              key={index}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div>
                <h2>{selectedMarker.title}</h2>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default MapComponent;