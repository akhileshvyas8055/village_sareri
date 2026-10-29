import React from 'react';
import './weather-effects.css';

export const WeatherEffects = ({ theme }) => {
  // Common container for effects
  const EffectContainer = ({ children }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl z-0">
      {children}
    </div>
  );

  const renderSunny = () => (
    <EffectContainer>
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/30 rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/40 rounded-full blur-[40px] weather-spin-slow"></div>
    </EffectContainer>
  );

  const renderHot = (extreme = false) => (
    <EffectContainer>
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent"></div>
      <div className="absolute -bottom-10 left-0 right-0 h-32 bg-orange-600/20 blur-[50px] weather-mirage"></div>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[60px] weather-spin-slow ${extreme ? 'bg-red-500/40' : 'bg-orange-500/30'}`}></div>
    </EffectContainer>
  );

  const renderRain = (heavy = false) => (
    <EffectContainer>
      {/* Fog/Mist base */}
      <div className="absolute inset-0 bg-slate-900/10"></div>
      {/* Raindrops */}
      {[...Array(heavy ? 20 : 12)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-[2px] h-[30px] bg-blue-300/40 rounded-full weather-rain-drop"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </EffectContainer>
  );

  const renderSnow = () => (
    <EffectContainer>
      <div className="absolute inset-0 bg-blue-100/10"></div>
      {[...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-2 h-2 bg-white/80 rounded-full blur-[1px] weather-snow-flake"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 3}s`,
            transform: `scale(${0.5 + Math.random()})`
          }}
        />
      ))}
    </EffectContainer>
  );

  const renderCloudy = (night = false) => (
    <EffectContainer>
      <div className={`absolute top-10 w-[200%] h-32 rounded-full blur-[60px] weather-cloud-drift ${night ? 'bg-slate-700/40' : 'bg-white/40'}`} style={{ animationDuration: '40s' }}></div>
      <div className={`absolute top-20 w-[150%] h-40 rounded-full blur-[80px] weather-cloud-drift ${night ? 'bg-slate-800/50' : 'bg-gray-200/50'}`} style={{ animationDuration: '60s', animationDirection: 'reverse' }}></div>
    </EffectContainer>
  );

  const renderStorm = () => (
    <EffectContainer>
      <div className="absolute inset-0 bg-slate-900/30"></div>
      <div className="absolute inset-0 bg-white/0 weather-lightning"></div>
      {renderRain(true)}
    </EffectContainer>
  );

  const renderFog = () => (
    <EffectContainer>
      <div className="absolute inset-0 bg-gray-300/20 backdrop-blur-[2px]"></div>
      <div className="absolute top-1/4 w-[200%] h-32 bg-gray-100/30 blur-[40px] weather-cloud-drift" style={{ animationDuration: '30s' }}></div>
    </EffectContainer>
  );

  const renderNight = () => (
    <EffectContainer>
      <div className="absolute top-10 right-10 w-24 h-24 bg-indigo-200/20 rounded-full blur-[30px]"></div>
      <div className="absolute top-12 right-12 w-16 h-16 bg-blue-100/40 rounded-full blur-[10px]"></div>
      {[...Array(10)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-1 h-1 bg-white/60 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.8,
            animation: `weather-mirage ${2 + Math.random() * 3}s infinite alternate`
          }}
        />
      ))}
    </EffectContainer>
  );

  switch (theme) {
    case 'sunny': return renderSunny();
    case 'hot': return renderHot(false);
    case 'extreme-hot': return renderHot(true);
    case 'rain': return renderRain(false);
    case 'heavy-rain': return renderRain(true);
    case 'snow': return renderSnow();
    case 'cloudy': return renderCloudy(false);
    case 'storm': return renderStorm();
    case 'fog': return renderFog();
    case 'clear-night': return renderNight();
    case 'rain-night': 
      return (
        <EffectContainer>
          {renderNight()}
          {renderRain(false)}
        </EffectContainer>
      );
    case 'cloudy-night':
      return (
        <EffectContainer>
          {renderNight()}
          {renderCloudy(true)}
        </EffectContainer>
      );
    case 'cold':
    default:
      return (
        <EffectContainer>
          <div className="absolute inset-0 bg-blue-200/10 backdrop-blur-[1px]"></div>
        </EffectContainer>
      );
  }
};

export const getThemeGradient = (theme) => {
  switch (theme) {
    case 'sunny': return 'from-blue-400 to-sky-200 dark:from-blue-600 dark:to-sky-400';
    case 'hot': return 'from-orange-300 to-amber-100 dark:from-orange-600 dark:to-amber-400';
    case 'extreme-hot': return 'from-red-400 to-orange-300 dark:from-red-700 dark:to-orange-500';
    case 'rain': return 'from-slate-500 to-slate-300 dark:from-slate-700 dark:to-slate-600';
    case 'heavy-rain': return 'from-slate-600 to-slate-400 dark:from-slate-800 dark:to-slate-700';
    case 'snow': return 'from-blue-100 to-indigo-50 dark:from-slate-600 dark:to-slate-500';
    case 'cloudy': return 'from-gray-300 to-slate-200 dark:from-gray-600 dark:to-slate-500';
    case 'storm': return 'from-slate-700 to-gray-600 dark:from-slate-900 dark:to-gray-800';
    case 'fog': return 'from-gray-200 to-gray-100 dark:from-gray-600 dark:to-gray-500';
    case 'clear-night': return 'from-indigo-900 to-slate-800';
    case 'rain-night': return 'from-slate-900 to-indigo-950';
    case 'cloudy-night': return 'from-slate-800 to-gray-900';
    case 'cold': return 'from-cyan-100 to-blue-50 dark:from-cyan-900 dark:to-slate-800';
    default: return 'from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900';
  }
};
