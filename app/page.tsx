"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Map from "@/app/components/Map";
import Modal from "@/app/components/Modal";
import { Subasta, LocationsAPIResponse } from "@/app/interfaces";
import Loader from "@/app/components/Loader";

export default function Home() {
  const [openModal, setOpenModal] = useState(false);
  const [subastasEnMapa, setSubastasEnMapa] = useState<Subasta[]>([]);
  const [subastasSinMapa, setSubastasSinMapa] = useState<Subasta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleModal = () => setOpenModal(!openModal);

  // Scrape data from Subastas portal, format with AI and store in database
  const syncData = async () => {
    // First API call
    try {
      setIsLoading(true);
      setLoadingMessage("Sincronizando subastas del portal...");
      setError(null);
  
      const subasta_portal_response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/sincroniza_subastas`
      );
  
      if (!subasta_portal_response.ok) {
        throw new Error("Failed to fetch subastas from portal");
      }
  
      const subasta_portal_data: LocationsAPIResponse = await subasta_portal_response.json();
      
      // Second API call
      try {
        setLoadingMessage("Actualizando datos en el mapa...");
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subastas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subasta_portal_data)
        });
  
        if (!res.ok) {
          throw new Error('Error al actualizar subastas en el mapa');
        }
  
        const data = await res.json();
        setSubastasEnMapa(data.subastasEnMapa);
        setSubastasSinMapa(data.subastasSinMapa);
  
      } catch (err) {
        console.error("Error updating map data:", err);
        setError(err instanceof Error ? err.message : "Error al actualizar el mapa");
        throw err; // Re-throw to trigger the finally block
      }
  
    } catch (err) {
      console.error("Error syncing subastas:", err);
      setError(err instanceof Error ? err.message : "Error al sincronizar datos");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Get location data that's been store in the database
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subastas`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subastas");
      }

      const data: LocationsAPIResponse = await response.json();

      setSubastasEnMapa(data.subastasEnMapa);
      setSubastasSinMapa(data.subastasSinMapa);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching subastas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="flex flex-col h-screen w-full">
      {openModal && <Modal toggleModal={toggleModal} />}
      <Header setOpenModal={toggleModal} syncData={syncData} />
      {isLoading ? <Loader/> : <Map addresses={subastasEnMapa} />}
    </main>
  );
}
