import { useState, useEffect } from 'react';

// Default initial data
export const defaultData = {
  about: {
    title: "Brahmano Ki Sareri",
    description1: "Brahmano Ki Sareri, Bhilwara district (Rajasthan) का एक सुंदर, सांस्कृतिक और तेजी से विकसित होता हुआ गांव है। यह गांव अपनी समृद्ध परंपराओं, धार्मिक आस्था और मजबूत सामाजिक एकता के लिए जाना जाता है। गांव में शिक्षा, कृषि, व्यापार और आधुनिक सुविधाओं का अच्छा विकास देखने को मिलता है।",
    description2: "यहां के लोग मेहनती, मिलनसार और अपनी संस्कृति से गहराई से जुड़े हुए हैं। गांव में कई मंदिर, स्कूल और सामाजिक स्थल हैं, जो इसकी पहचान को और मजबूत बनाते हैं। पारंपरिक त्योहारों, धार्मिक आयोजनों और सामुदायिक कार्यक्रमों में पूरे गांव की सक्रिय भागीदारी इसकी एकता और भाईचारे को दर्शाती है। Brahmano Ki Sareri आज परंपरा और आधुनिकता का सुंदर संगम बनकर प्रगति की ओर निरंतर अग्रसर है।",
    population: "4,576+",
    location: "Asind, Bhilwara",
    families: "922+",
    literacy: "67.6%"
  },
  hero: {
    title: "Welcome to Village Sareri",
    subtitle: "Bhilwara, Rajasthan"
  },
  festivals: [
    {
      id: 1,
      name: 'Diwali Celebration',
      desc: 'The festival of lights brings the whole village together, illuminating every home with joy and prosperity.',
      image: '',
    },
    {
      id: 2,
      name: 'Holi Colors',
      desc: 'A vibrant display of unity and happiness as the entire community plays with colors and traditional music.',
      image: '',
    },
    {
      id: 3,
      name: 'Gangaur Puja',
      desc: 'A significant cultural festival honoring Goddess Gauri, celebrated with traditional attire and folk dances.',
      image: '',
    },
    {
      id: 4,
      name: 'Local Village Fairs',
      desc: 'Annual gatherings featuring local crafts, thrilling rides, folk performances, and delicious local cuisines.',
      image: '',
    }
  ],
  gallery: [
    { id: 1, category: 'Nature', src: '', title: 'Nature in Sareri' },
    { id: 2, category: 'Temples', src: '', title: 'Village Temple' },
    { id: 3, category: 'Festivals', src: '', title: 'Festival Celebration' },
    { id: 4, category: 'Events', src: '', title: 'Community Event' },
    { id: 5, category: 'Nature', src: '', title: 'Agriculture & Farms' },
    { id: 6, category: 'Old Memories', src: '', title: 'Historical Memory' },
    { id: 7, category: 'Temples', src: '', title: 'Religious Site' },
    { id: 8, category: 'Festivals', src: '', title: 'Local Culture' },
  ],
  people: [
    { id: 1, name: 'Shri Ramdev Singh', role: 'Village Sarpanch', image: '', desc: 'Leading the village towards modernization while preserving our rich heritage.' },
    { id: 2, name: 'Capt. Vikram Rathore', role: 'Army Officer', image: '', desc: 'Serving the nation with pride and inspiring the youth of Sareri.' },
    { id: 3, name: 'Smt. Anita Devi', role: 'Head Teacher', image: '', desc: 'Dedicated to illuminating young minds and fostering education.' },
    { id: 4, name: 'Dr. Ashok Kumar', role: 'Social Worker', image: '', desc: 'Tirelessly working for the healthcare and betterment of the villagers.' },
  ],
  news: [
    { id: 1, img: '', likes: '2.1k' },
    { id: 2, img: '', likes: '1.8k' },
    { id: 3, img: '', likes: '3.4k' },
    { id: 4, img: '', likes: '1.2k' },
  ]
};

// Custom hook to get and set data
export const useSiteData = () => {
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    const savedData = localStorage.getItem('sareriSiteData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData({ ...defaultData, ...parsed });
      } catch (e) {
        console.error("Failed to parse site data", e);
      }
    }
  }, []);

  const updateData = (newData) => {
    setData(newData);
    localStorage.setItem('sareriSiteData', JSON.stringify(newData));
  };

  const updateSectionField = (section, field, value) => {
    setData(prev => {
      const newData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
      localStorage.setItem('sareriSiteData', JSON.stringify(newData));
      return newData;
    });
  };

  const updateArrayItem = (section, id, field, value) => {
    setData(prev => {
      const newData = {
        ...prev,
        [section]: prev[section].map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      };
      localStorage.setItem('sareriSiteData', JSON.stringify(newData));
      return newData;
    });
  };

  return { data, updateData, updateSectionField, updateArrayItem };
};

import { createContext, useContext } from 'react';

export const AdminContext = createContext({
  isEditMode: false,
  setIsEditMode: () => {}
});

export const useAdmin = () => useContext(AdminContext);
