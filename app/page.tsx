"use client";
import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import Map from "@/app/components/Map";
import Modal from "@/app/components/Modal";
import { Subasta, LocationsAPIResponse } from "@/app/interfaces";

const tempResponse:LocationsAPIResponse  = {
  subastasEnMapa: [
    {
      name: "SUBASTA SUB-JA-2024-TEMP",
      text: "SUBASTA SUB-JA-2024-TEMP",
      location: "6 Calle de las Infantas, Madrid, Spain",
      link: "https://temp.com",
    },
    {
      name: "SUBASTA SUB-JA-2024-TEMP",
      text: "SUBASTA SUB-JA-2024-TEMP",
      location: "Plaza Mayor, Madrid, Spain",
      link: "https://temp.com",
    },
    {
      name: "SUBASTA SUB-JA-2024-TEMP",
      text: "SUBASTA SUB-JA-2024-TEMP",
      location: "Retiro Park, Madrid, Spain",
      link: "https://temp.com",
    },
    {
      name: "SUBASTA SUB-JA-2024-TEMP",
      text: "SUBASTA SUB-JA-2024-TEMP",
      location: "Royal Palace of Madrid, Madrid, Spain",
      link: "https://temp.com",
    },
  ],
  subastasSinMapa: [],
};

export default function Home() {
  const [openModal, setOpenModal] = useState(false);
  const [addresses, setAddresses] = useState<Subasta[]>([]);

  // useEffect(() => {
  //   setAddresses(tempResponse.subastasEnMapa);
  // }, []);
  // const [addresses_not_on_map, setAddressesNotonMap] = useState<Subasta[]>(tempResponse.subastasSinMapa);

  const toggleModal = () => setOpenModal(!openModal);

  // Scrape data from Subastas portal, format with AI and store in database
  const syncData = () => {};

  // Get location data that's been store in the database
  const fetchData = () => {};

  return (
    <main className="flex flex-col h-screen w-full">
      {openModal && <Modal toggleModal={toggleModal} />}
      <Header setOpenModal={toggleModal} />
      <Map addresses={tempResponse.subastasEnMapa} />
    </main>
  );
}
