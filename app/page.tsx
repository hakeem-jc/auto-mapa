"use client";
import { useState } from "react";
import Header from "@/app/components/Header";
import Map from "@/app/components/Map";
import Modal from "@/app/components/Modal";

export default function Home() {
  const [openModal, setOpenModal] = useState(false);

  const toggleModal = () => setOpenModal(!openModal);

  // Scrape data from Subastas portal, format with AI and store in database
  const syncData = () => {

  }
  
  // Get location data that's been store in the database
  const fetchData = () => {

  }


  return (
    <main className="flex flex-col h-screen w-full">
      {openModal && <Modal toggleModal={toggleModal} />}
      <Header setOpenModal={toggleModal} />
      <Map />
    </main>
  );
}
