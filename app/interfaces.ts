export interface Subasta {
  name: string;
  text: string;
  location: string;
  link: string;
}

export interface LocationRequest {
  name: string;
  text: string;
}

interface LocationResponse {
  name: string;
  location: string;
}

export interface Locations {
  mapped_locations: LocationResponse[],
  unmapped_locations: LocationResponse[]
}

export interface LocationsAPIResponse {
  subastasEnMapa: Subasta[],
  subastasSinMapa: Subasta[]
}
