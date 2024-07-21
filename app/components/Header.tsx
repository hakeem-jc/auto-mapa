const Header = ( { setOpenModal } : { setOpenModal: () => void }) => {
  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            MapMarker
          </span>
        </a>
        <div className="flex space-x-3 md:space-x-0">
          <button
            type="button"
            onClick={() => setOpenModal()}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Añadir Ubicaciones
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
