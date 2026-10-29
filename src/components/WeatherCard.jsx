import { useState, useEffect } from 'react';
import { FiSun, FiCloud, FiCloudDrizzle, FiCloudRain, FiCloudLightning, FiWind, FiMapPin, FiDroplet } from 'react-icons/fi';
import { getWeatherTheme, getWeatherDetails } from './weather/weatherUtils';
import { WeatherEffects, getThemeGradient } from './weather/WeatherEffects';

const WeatherCard = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coordinates for Sareri / Bhilwara region
    const lat = 25.83;
    const lon = 74.65;
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`)
      .then(res => res.json())
      .then(data => {
        setWeather(data.current);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching weather:", err);
        setLoading(false);
      });
  }, []);

  const getIcon = (code) => {
    if (code === 0) return <FiSun className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />;
    if (code >= 1 && code <= 3) return <FiCloud className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200" />;
    if (code === 45 || code === 48) return <FiWind className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />;
    if (code >= 51 && code <= 55) return <FiCloudDrizzle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-300" />;
    if (code >= 61 && code <= 65) return <FiCloudRain className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" />;
    if (code >= 95) return <FiCloudLightning className="w-10 h-10 sm:w-12 sm:h-12 text-purple-300" />;
    return <FiSun className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400" />;
  };

  if (loading || !weather) {
    // Fallback loading state with neutral premium styling
    return (
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-xl w-full max-w-[340px] md:max-w-md mx-auto md:mx-0 h-[180px] animate-pulse">
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 font-medium tracking-widest text-sm uppercase">Loading Weather...</span>
        </div>
      </div>
    );
  }

  const {
    temperature_2m: temp,
    weather_code: code,
    is_day: isDay,
    wind_speed_10m: wind,
    relative_humidity_2m: humidity,
    apparent_temperature: feelsLike
  } = weather;

  const theme = getWeatherTheme(code, temp, isDay, wind);
  const details = getWeatherDetails(code);
  const bgGradient = getThemeGradient(theme);
  
  // Determine text color based on theme
  const isDarkTheme = theme.includes('night') || theme === 'storm' || theme === 'heavy-rain';
  const textColor = isDarkTheme ? 'text-white' : 'text-gray-900 dark:text-white';
  const subtextColor = isDarkTheme ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300';
  const glassBg = isDarkTheme ? 'bg-black/30 border-white/10' : 'bg-white/25 dark:bg-black/25 border-white/30 dark:border-white/10';

  return (
    <div className={`relative overflow-hidden w-full max-w-[340px] md:max-w-[400px] mx-auto md:mx-0 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transform transition-all duration-1000 bg-gradient-to-br ${bgGradient}`}>
      
      {/* Background Weather Effects Layer */}
      <WeatherEffects theme={theme} />
      
      {/* Premium Glassmorphic Card Overlay */}
      <div className={`relative z-10 p-6 flex flex-col justify-between h-full backdrop-blur-md transition-colors duration-700 ${glassBg}`}>
        
        {/* Top Info */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-col">
            <div className={`flex items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] sm:text-xs mb-2 opacity-90 ${isDarkTheme ? 'text-blue-100' : 'text-indigo-700 dark:text-indigo-300'}`}>
              <FiMapPin className="w-3.5 h-3.5" />
              <span className="notranslate" translate="no">Brahmano Ki Sareri</span>
            </div>
            <h3 className={`text-4xl sm:text-5xl font-extrabold flex items-start leading-none tracking-tight ${textColor}`}>
              {Math.round(temp)}<span className="text-xl sm:text-2xl mt-1 opacity-70">°C</span>
            </h3>
            <p className={`text-sm sm:text-base mt-2 font-semibold ${textColor}`}>
              {details.text}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/20 dark:bg-black/20 shadow-inner border border-white/20 shrink-0 backdrop-blur-xl">
            {getIcon(code)}
          </div>
        </div>

        {/* Bottom Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-white/10 dark:bg-black/10 border border-white/10 backdrop-blur-md`}>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FiSun className={`w-3.5 h-3.5 ${textColor}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold opacity-70 ${subtextColor}`}>Feels Like</span>
              <span className={`text-xs font-bold ${textColor}`}>{Math.round(feelsLike)}°C</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-white/10 dark:bg-black/10 border border-white/10 backdrop-blur-md`}>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FiDroplet className={`w-3.5 h-3.5 ${textColor}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold opacity-70 ${subtextColor}`}>Humidity</span>
              <span className={`text-xs font-bold ${textColor}`}>{humidity}%</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 p-2.5 rounded-xl bg-white/10 dark:bg-black/10 border border-white/10 backdrop-blur-md col-span-2`}>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <FiWind className={`w-3.5 h-3.5 ${textColor}`} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] uppercase font-bold opacity-70 ${subtextColor}`}>Wind Speed</span>
              <span className={`text-xs font-bold ${textColor}`}>{wind} km/h</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default WeatherCard;
