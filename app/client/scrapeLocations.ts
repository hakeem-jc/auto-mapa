import { LocationsAPIResponse } from "@/app/interfaces";

export const scrapeLocations = async (): Promise<LocationsAPIResponse | null> => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/locations`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Response status: ${response.status}`);
      return null;
    }

    const json: LocationsAPIResponse = await response.json();
    return json;

    // setAddresses(json.subastasEnMapa);
    // setAddressesNotonMap(json.subastasSinMapa);
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
};