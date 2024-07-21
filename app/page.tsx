'use client'
import { useState } from "react";
import Header from "./components/Header";
import Map from "./components/Map";
import Modal from "./components/Modal";

export default function Home() {
  const [openModal, setOpenModal] = useState(false);

  const toggleModal = () => setOpenModal(!openModal)

  return (
    <main className="flex flex-col h-screen w-full">
      {openModal && <Modal />}
      <Header setOpenModal={toggleModal}/>
      <Map />
    </main>
  );
}
