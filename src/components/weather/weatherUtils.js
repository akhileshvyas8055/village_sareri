export const getWeatherTheme = (code, temp, isDay, wind) => {
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 95 && code <= 99) return 'storm';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 51 && code <= 55) return 'heavy-rain'; 
  if (code === 45 || code === 48) return 'fog';

  if (isDay === 0) {
    if (code >= 61) return 'rain-night';
    if (code >= 1 && code <= 3) return 'cloudy-night';
    return 'clear-night';
  }

  // Day time
  if (code >= 1 && code <= 3) return 'cloudy';
  
  if (temp >= 40) return 'extreme-hot';
  if (temp >= 34) return 'hot';
  if (temp <= 5) return 'snow'; 
  if (temp <= 15) return 'cold';

  return 'sunny';
};

export const getWeatherDetails = (code) => {
  if (code === 0) return { text: 'Clear Sky', hindi: 'साफ आसमान' };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', hindi: 'आंशिक बादल' };
  if (code === 45 || code === 48) return { text: 'Fog', hindi: 'कोहरा' };
  if (code >= 51 && code <= 55) return { text: 'Drizzle', hindi: 'बूंदाबांदी' };
  if (code >= 61 && code <= 65) return { text: 'Rain', hindi: 'बारिश' };
  if (code >= 71 && code <= 77) return { text: 'Snow', hindi: 'बर्फबारी' };
  if (code >= 95) return { text: 'Thunderstorm', hindi: 'आंधी तूफान' };
  return { text: 'Clear', hindi: 'साफ' };
};
