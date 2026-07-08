import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seoData = {
  'Home.jsx': `      <SEO 
        title="BRAHMANO KI SARERI - Connecting Village with Future"
        description="Welcome to the official website of Brahmano Ki Sareri. Explore village culture, news, panchayat updates, events, and community activities. ब्राह्मणों की सरेरी की डिजिटल दुनिया में आपका स्वागत है।"
        url="https://villagesareri.in/"
      />`,
  'AboutPage.jsx': `      <SEO 
        title="About Brahmano Ki Sareri | History, Culture & Temples"
        description="Discover the rich history, culture, traditions, and famous temples of Brahmano Ki Sareri village, Asind, Bhilwara, Rajasthan."
        url="https://villagesareri.in/about"
      />`,
  'GalleryPage.jsx': `      <SEO 
        title="Village Gallery | Photos & Videos of Brahmano Ki Sareri"
        description="Explore beautiful photos and videos of Brahmano Ki Sareri including festivals, temples, Sareri Shyam Khel Mahotsav, and village life."
        url="https://villagesareri.in/gallery"
      />`,
  'NewsPage.jsx': `      <SEO 
        title="Sareri News & Updates | Latest Announcements"
        description="Stay updated with the latest village news, announcements, notices, and important updates from Brahmano Ki Sareri community."
        url="https://villagesareri.in/news"
      />`,
  'Panchayat.jsx': `      <SEO 
        title="Sareri Gram Panchayat | Sarpanch & Ward Panch Details"
        description="Get details about Sareri Gram Panchayat, Sarpanch, Ward Panchs, village administration, and development initiatives."
        url="https://villagesareri.in/panchayat"
      />`,
  'ComplaintPage.jsx': `      <SEO 
        title="Jan Sunwai & Complaints | Sareri Gram Panchayat"
        description="Submit complaints, suggestions, and public feedback online to Sareri Gram Panchayat for better governance and transparency."
        url="https://villagesareri.in/complaint"
      />`,
  'PridePage.jsx': `      <SEO 
        title="Pride of Sareri | Achievements & Khel Mahotsav"
        description="Celebrating the achievements of Brahmano Ki Sareri and showcasing the grand Sareri Shyam Khel Mahotsav."
        url="https://villagesareri.in/pride"
      />`,
  'CommunityPage.jsx': `      <SEO 
        title="Sareri Community Connect | Discussions & Polls"
        description="Join community discussions, participate in village polls, share opinions, and stay connected with Brahmano Ki Sareri."
        url="https://villagesareri.in/community"
      />`
};

const pagesDir = path.join(__dirname, 'src', 'pages');

Object.keys(seoData).forEach(filename => {
  const filePath = path.join(pagesDir, filename);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace <SEO ... /> tag
    const seoRegex = /<SEO[\s\S]*?\/>/;
    if (seoRegex.test(content)) {
      content = content.replace(seoRegex, seoData[filename]);
      fs.writeFileSync(filePath, content);
      console.log('Updated SEO for ' + filename);
    }
  }
});

