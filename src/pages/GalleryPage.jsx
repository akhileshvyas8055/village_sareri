import Gallery from '../sections/Gallery';

const GalleryPage = () => {
  return (
    <div className="pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="text-center py-12">
        <h1 className="text-5xl md:text-6xl font-bold font-heading text-gray-900 dark:text-white mb-4">
          Village <span className="text-saffron">Gallery</span>
        </h1>
        <div className="w-24 h-1 bg-saffron mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
          Explore the vibrant events, festivals, and beautiful moments captured in Brahmano Ki Sareri.
        </p>
      </div>

      <Gallery title="Village Moments" folder="slideshow" description="Beautiful moments from Brahmano Ki Sareri." />
      <Gallery title="Ramleela Mahotsav" folder="ramlila" description="Over 50 years of rich cultural heritage where locals perform the epic of Ramayana." />
      <Gallery title="Mela Purnima" folder="mela" description="Glimpses from the sacred Mela Purnima celebrations and gatherings." />
      <Gallery title="Khel Mahotsav" folder="khelmhautsav" description="Glimpses from the exciting village sports festival." />
      <Gallery title="Jaljulni Ekadashi" folder="jaljulni" description="Sacred Jaljulni Ekadashi celebrations and processions in our village." />
      <Gallery title="Sacred Temples" folder="mandir" description="Our beautiful historic temples and spiritual core." />
    </div>
  );
};

export default GalleryPage;
