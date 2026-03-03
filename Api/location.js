// Api/location.js
import { Country, State, City } from 'country-state-city';

// দেশের নাম থেকে country code ম্যাপিং
const COUNTRY_CODE_MAP = {
  'USA': 'US',
  'UK': 'GB',
  'Canada': 'CA'
};

// রাজ্য/প্রদেশ পাওয়ার ফাংশন
export function getStates(country) {
  try {
    console.log('📍 getStates called for:', country);
    const countryCode = COUNTRY_CODE_MAP[country];
    if (!countryCode) return [];
    
    // ✅ সঠিক API: State.getStatesOfCountry()
    const states = State.getStatesOfCountry(countryCode);
    console.log(`✅ Found ${states.length} states for ${country}`);
    
    return states.map(state => ({
      name: state.name,
      code: state.isoCode
    }));
  } catch (error) {
    console.error('❌ Error in getStates:', error);
    return [];
  }
}

// শহর পাওয়ার ফাংশন
export function fetchCitiesByState(country, stateName) {
  try {
    console.log('📍 fetchCitiesByState called for:', stateName);
    const countryCode = COUNTRY_CODE_MAP[country];
    if (!countryCode) return [];
    
    const states = State.getStatesOfCountry(countryCode);
    const selectedState = states.find(s => s.name === stateName);
    
    if (!selectedState) {
      console.warn('⚠️ State not found:', stateName);
      return [];
    }
    
    // ✅ সঠিক API: City.getCitiesOfState()
    const cities = City.getCitiesOfState(countryCode, selectedState.isoCode);
    console.log(`✅ Found ${cities.length} cities for ${stateName}`);
    
    return cities.map(city => ({
      name: city.name
    }));
  } catch (error) {
    console.error('❌ Error in fetchCitiesByState:', error);
    return [];
  }
}

// পোস্টাল কোড - country-state-city প্যাকেজে নেই
export function getPostalCodes() {
  console.warn('⚠️ Postal codes not available in country-state-city package');
  return [];
}