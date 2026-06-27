import { useState, useEffect } from 'react';
import { FiSun, FiCloud, FiCloudDrizzle, FiCloudRain, FiCloudLightning, FiWind, FiMapPin } from 'react-icons/fi';

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coordinates for Sareri / Bhilwara region
    const lat = 25.83;
    const lon = 74.65;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        setWeather(data.current_weather);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching weather:", err);
        setLoading(false);
      });
  }, []);

  const getWeatherDetails = (code) => {
    if (code === 0) return { text: 'Clear Sky / साफ आसमान', icon: <FiSun className="w-12 h-12 text-yellow-400" /> };
    if (code >= 1 && code <= 3) return { text: 'Partly Cloudy / आंशिक बादल', icon: <FiCloud className="w-12 h-12 text-gray-400" /> };
    if (code === 45 || code === 48) return { text: 'Fog / कोहरा', icon: <FiWind className="w-12 h-12 text-gray-300" /> };
    if (code >= 51 && code <= 55) return { text: 'Drizzle / बूंदाबांदी', icon: <FiCloudDrizzle className="w-12 h-12 text-blue-300" /> };
    if (code >= 61 && code <= 65) return { text: 'Rain / बारिश', icon: <FiCloudRain className="w-12 h-12 text-blue-500" /> };
    if (code >= 95) return { text: 'Thunderstorm / आंधी तूफान', icon: <FiCloudLightning className="w-12 h-12 text-purple-500" /> };
    return { text: 'Clear / साफ', icon: <FiSun className="w-12 h-12 text-yellow-400" /> };
  };

  if (loading || !weather) return null;

  const details = getWeatherDetails(weather.weathercode);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-blue-100 dark:border-gray-700 flex flex-row items-center justify-between gap-4 transform transition-all hover:-translate-y-1 w-full max-w-[340px] md:max-w-sm mx-auto md:mx-0">
      <div className="flex flex-col items-start text-left">
        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold tracking-wider uppercase text-[10px] sm:text-xs mb-1.5">
          <FiMapPin className="w-3.5 h-3.5" />
          <span className="notranslate">Brahmano Ki Sareri</span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-start leading-none">
          {Math.round(weather.temperature)}<span className="text-lg sm:text-xl mt-0.5 text-gray-500 dark:text-gray-400">°C</span>
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1.5 font-medium">{details.text.split(' / ')[0]}<br className="hidden sm:block"/><span className="sm:hidden"> / </span>{details.text.split(' / ')[1]}</p>
      </div>
      
      <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-inner border border-white/50 dark:border-gray-700/50 shrink-0">
        {details.icon}
        <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mt-2 text-center">Live<br/>Weather</div>
      </div>
    </div>
  );
};

export default WeatherCard;
