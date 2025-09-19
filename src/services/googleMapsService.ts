import { Loader } from '@googlemaps/js-api-loader';
import { GoogleMapsPlace } from '../types';

class GoogleMapsService {
  private loader: Loader;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private isValidApiKey: boolean;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.isValidApiKey = apiKey && apiKey !== 'your_google_maps_api_key' && apiKey.length > 10;
    
    if (this.isValidApiKey) {
      this.loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places']
      });
    }
  }

  async initialize(): Promise<void> {
    if (!this.isValidApiKey) {
      console.warn('Google Maps API key is not configured. Location search will not work.');
      return;
    }
    
    try {
      await this.loader.load();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService
      const div = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(div);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw new Error('Failed to load Google Maps');
    }
  }

  async searchPlaces(query: string): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.isValidApiKey) {
      return [];
    }
    
    if (!this.autocompleteService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.autocompleteService) {
        reject(new Error('Autocomplete service not initialized'));
        return;
      }

      this.autocompleteService.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' }, // Restrict to India
          types: ['address']
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            resolve([]);
          }
        }
      );
    });
  }

  async getPlaceDetails(placeId: string): Promise<GoogleMapsPlace | null> {
    if (!this.isValidApiKey) {
      return null;
    }
    
    if (!this.placesService) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('Places service not initialized'));
        return;
      }

      this.placesService.getDetails(
        {
          placeId: placeId,
          fields: ['place_id', 'formatted_address', 'geometry', 'address_components']
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            resolve({
              place_id: place.place_id!,
              formatted_address: place.formatted_address!,
              geometry: {
                location: {
                  lat: place.geometry!.location!.lat(),
                  lng: place.geometry!.location!.lng()
                }
              },
              address_components: place.address_components || []
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  parseAddressComponents(addressComponents: google.maps.GeocoderAddressComponent[]): {
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } {
    let city = '';
    let state = '';
    let postalCode = '';
    let country = 'India';

    addressComponents.forEach(component => {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('postal_code')) {
        postalCode = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    });

    return { city, state, postalCode, country };
  }

  async getLocalityFromCoordinates(lat: number, lng: number): Promise<string | null> {
    if (!this.isValidApiKey) {
      return null;
    }

    try {
      await this.initialize();
      
      const geocoder = new google.maps.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.geocode(
          { location: { lat, lng } },
          (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const addressComponents = results[0].address_components;
              let locality = '';
              let city = '';
              
              // Look for locality first, then city
              for (const component of addressComponents) {
                if (component.types.includes('sublocality_level_1') || 
                    component.types.includes('sublocality')) {
                  locality = component.long_name;
                  break;
                } else if (component.types.includes('locality')) {
                  city = component.long_name;
                }
              }
              
              // Return locality with city, or just city if no locality found
              if (locality && city) {
                resolve(`${locality}, ${city}`);
              } else if (city) {
                resolve(city);
              } else {
                resolve(null);
              }
            } else {
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error getting locality from coordinates:', error);
      return null;
    }
  }
}

export const googleMapsService = new GoogleMapsService();