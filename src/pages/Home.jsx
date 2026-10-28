import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import {
  FiArrowRight, FiArrowUpRight, FiAward, FiBell, FiCalendar,
  FiCheckCircle, FiChevronRight, FiClock, FiCompass, FiFileText,
  FiHeart, FiMapPin, FiMessageSquare, FiSearch, FiShield,
  FiShoppingBag, FiUsers
} from 'react-icons/fi';
import { rtdb } from '../firebase';
import SEO from '../components/SEO';
import WeatherCard from '../components/WeatherCard';
import CountdownWidget from '../components/CountdownWidget';
import KhelBanner from '../sections/KhelBanner';
import PollWidget from '../components/PollWidget';
import VirtualTourBanner from '../components/VirtualTourBanner';

const services = [
  { title: 'सूचना बोर्ड', english: 'Digital Notice Board', icon: FiBell, to: '/panchayat', keywords: 'notices alerts news suchna notice', color: 'text-blue-700', background: 'bg-blue-50 dark:bg-blue-950/40' },
  { title: 'पंचायत सेवाएँ', english: 'Panchayat Services', icon: FiFileText, to: '/panchayat', keywords: 'government schemes certificate panchayat sarkari', color: 'text-emerald-700', background: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { title: 'हमारा सरेरी', english: 'Explore Sareri', icon: FiCompass, to: '/about', keywords: 'village places history explore location', color: 'text-violet-700', background: 'bg-violet-50 dark:bg-violet-950/40' },
  { title: 'आयोजन व संस्कृति', english: 'Events & Culture', icon: FiCalendar, to: '/news', keywords: 'events festivals culture utsav mela', color: 'text-amber-700', background: 'bg-amber-50 dark:bg-amber-950/40' },
  { title: 'स्थानीय व्यवसाय', english: 'Local Businesses', icon: FiShoppingBag, to: null, keywords: 'shops business sweets mithai grocery directory', color: 'text-cyan-700', background: 'bg-cyan-50 dark:bg-cyan-950/40' },
  { title: 'शिकायत व सुझाव', english: 'Complaints & Feedback', icon: FiMessageSquare, to: '/complaint', keywords: 'complaint feedback water road problem samasya', color: 'text-rose-700', background: 'bg-rose-50 dark:bg-rose-950/40' }
];

const mapEntries = (value) => Object.entries(value || {}).map(([id, item]) => ({ id, ...item }));
const byLatest = (a, b) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0);

const SectionHeading = ({ label, title, description, to, action = 'View all' }) => (
  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-[#0D9488]">{label}</span>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">{description}</p>}
    </div>
    {to && <Link to={to} className="inline-flex shrink-0 items-center gap-2 self-start rounded-full px-1 py-2 text-sm font-bold text-[#0D7195] hover:text-[#0D477A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D9488]">{action}<FiArrowRight /></Link>}
  </div>
);

const Home = () => {
  const [query, setQuery] = useState('');
  const [notices, setNotices] = useState([]);
  const [news, setNews] = useState([]);
  const [achievers, setAchievers] = useState([]);

  useEffect(() => {
    const unsubscribeNotices = onValue(
      ref(rtdb, 'panchayat/notices'),
      (snapshot) => setNotices(mapEntries(snapshot.val()).sort(byLatest).slice(0, 4)),
      () => setNotices([])
    );
    const unsubscribeNews = onValue(
      ref(rtdb, 'adminData/news'),
      (snapshot) => setNews(mapEntries(snapshot.val()).sort(byLatest).slice(0, 6)),
      () => setNews([])
    );
    const unsubscribeAchievers = onValue(
      ref(rtdb, 'adminData/achievements'),
      (snapshot) => setAchievers(mapEntries(snapshot.val()).sort(byLatest).slice(0, 3)),
      () => setAchievers([])
    );
    return () => {
      unsubscribeNotices();
      unsubscribeNews();
      unsubscribeAchievers();
    };
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredServices = useMemo(() => services.filter((item) =>
    !normalizedQuery || (item.title + ' ' + item.english + ' ' + item.keywords).toLocaleLowerCase().includes(normalizedQuery)
  ), [normalizedQuery]);
  const filteredNotices = useMemo(() => notices.filter((item) =>
    !normalizedQuery || (item.title + ' ' + (item.description || '')).toLocaleLowerCase().includes(normalizedQuery)
  ), [notices, normalizedQuery]);
  const recentNews = news.filter((item) => (item.type || '').toLocaleLowerCase() !== 'event').slice(0, 2);
  const eventNews = news.filter((item) => (item.type || '').toLocaleLowerCase() === 'event').slice(0, 2);

  return (
    <>
      <SEO
        title="Sareri Digital | Brahmano Ki Sareri Smart Village Portal"
        description="Brahmano Ki Sareri ka digital portal: Panchayat notices, village services, events, culture, local business updates, achievements and complaints."
        url="https://villagesareri.in/"
      />
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#0B1726] dark:text-white">
        <section className="relative isolate overflow-hidden bg-[#0D477A] pb-16 pt-32 text-white sm:pt-36 lg:pb-24 lg:pt-44">
          <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-sky-300/15 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-wide text-sky-100 backdrop-blur-sm sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-teal-300" /> DIGITAL SMART VILLAGE • RAJASTHAN
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                नमस्कार! <span className="block text-[#A7F3D0]">डिजिटल सरेरी में</span> आपका स्वागत है।
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-sky-100 sm:text-lg">
                हमारा गाँव, हमारी पहचान। पंचायत की सूचनाएँ, ज़रूरी सेवाएँ, गाँव की संस्कृति और समुदाय की जानकारी — सब एक जगह।
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#quick-services" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#0D477A] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Explore Services <FiArrowRight /></a>
                <Link to="/panchayat" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Latest Notices <FiBell /></Link>
              </div>
              <div className="mt-8 max-w-xl rounded-2xl border border-white/20 bg-white p-2 shadow-xl shadow-[#062F52]/20">
                <label htmlFor="sareri-home-search" className="sr-only">Search village services and notices</label>
                <div className="flex items-center gap-3 px-3">
                  <FiSearch className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    id="sareri-home-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="सेवाएँ या सूचनाएँ खोजें..."
                    className="h-12 min-w-0 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <a href="#quick-services" className="shrink-0 rounded-xl bg-[#0D9488] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#0F766E]">Search</a>
                </div>
              </div>
              <p className="mt-3 text-xs text-sky-200">Search quick services and available Panchayat notices.</p>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-[#062843]/30 backdrop-blur-lg">
                <div className="relative h-56 overflow-hidden rounded-[1.4rem] sm:h-72">
                  <img src="/photos/About.jpeg" alt="Brahmano Ki Sareri village" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#082D4B]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-200">Discover our roots</p>
                    <p className="mt-1 text-2xl font-extrabold">Brahmano Ki Sareri</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Link to="/panchayat" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20">
                    <FiShield className="h-6 w-6 text-teal-200" />
                    <span className="text-sm font-semibold">पंचायत जानकारी</span>
                  </Link>
                  <Link to="/gallery" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/20">
                    <FiCompass className="h-6 w-6 text-sky-200" />
                    <span className="text-sm font-semibold">Village Gallery</span>
                  </Link>
                </div>
              </div>
              <div className="relative z-10 mx-auto -mt-5 w-[94%]"><WeatherCard /></div>
            </div>
          </div>
        </section>

        <main>
          <section id="quick-services" className="scroll-mt-24 py-14 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading label="ONE-TAP ACCESS" title="आपकी ज़रूरी सेवाएँ" description="गाँव से जुड़ी जानकारी और सेवाओं तक पहुँचने का आसान तरीका।" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
                {filteredServices.map((service) => {
                  const Icon = service.icon;
                  const inner = (
                    <>
                      <span className={'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ' + service.background + ' ' + service.color}><Icon className="h-6 w-6" /></span>
                      <span className="block text-sm font-extrabold leading-snug text-slate-900 dark:text-white">{service.title}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{service.english}</span>
                      {service.to ? <FiArrowUpRight className="absolute right-3 top-4 text-slate-400" /> : <span className="mt-3 inline-block rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">Coming soon</span>}
                    </>
                  );
                  return service.to ? (
                    <Link key={service.english} to={service.to} className="relative flex min-h-40 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:bg-slate-800">{inner}</Link>
                  ) : (
                    <div key={service.english} className="relative flex min-h-40 flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">{inner}</div>
                  );
                })}
              </div>
              {filteredServices.length === 0 && <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">No matching service found. Try Panchayat, events, notices or business.</div>}
            </div>
          </section>

          <section className="bg-white py-14 dark:bg-slate-900/50 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
              <div>
                <SectionHeading label="STAY INFORMED" title="Digital Notice Board" description="ग्राम पंचायत की नई सूचनाएँ और महत्वपूर्ण अपडेट।" to="/panchayat" action="All notices" />
                <div className="space-y-3">
                  {filteredNotices.length ? filteredNotices.slice(0, 3).map((notice) => (
                    <Link to="/panchayat" key={notice.id} className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition hover:border-teal-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                      <span className="rounded-xl bg-amber-100 p-3 text-amber-700"><FiBell className="h-5 w-5" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 font-bold text-slate-900 dark:text-white">{notice.title}</span>
                        <span className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><FiClock />{notice.date || 'Panchayat update'}</span>
                      </span>
                      <FiChevronRight className="mt-2 shrink-0 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                  )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFC] p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">अभी कोई नई सूचना उपलब्ध नहीं है।</div>}
                </div>
              </div>
              <div>
                <SectionHeading label="LATEST NEWS" title="Sareri Updates" description="समुदाय से जुड़ी खबरें और घोषणाएँ।" to="/news" action="More updates" />
                <div className="space-y-3">
                  {recentNews.length ? recentNews.map((item) => (
                    <Link to="/news" key={item.id} className="group flex min-h-28 items-start gap-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition hover:border-teal-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                      {item.image ? <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" /> : <span className="rounded-xl bg-blue-100 p-3 text-blue-700"><FiFileText className="h-5 w-5" /></span>}
                      <span className="min-w-0 flex-1"><span className="line-clamp-2 font-bold">{item.title}</span><span className="mt-2 block line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.desc || item.date || 'Community update'}</span></span>
                      <FiArrowUpRight className="shrink-0 text-slate-400 group-hover:text-teal-600" />
                    </Link>
                  )) : <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFC] p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800">नई खबरें जल्द यहाँ दिखाई देंगी।</div>}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#0D477A] p-3 shadow-xl">
                <img src="/photos/About.jpeg" alt="View of Brahmano Ki Sareri" loading="lazy" className="h-72 w-full rounded-[1.4rem] object-cover sm:h-96" />
                <span className="absolute bottom-7 left-7 inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-bold text-[#0D477A] backdrop-blur-sm"><FiMapPin /> Brahmano Ki Sareri, Rajasthan</span>
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#0D9488]">EXPLORE SARERI</span>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">जानिए अपने गाँव को, करीब से।</h2>
                <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">सरेरी की संस्कृति, विरासत, ऐतिहासिक स्थल, शिक्षा और खूबसूरत यादों को एक जगह देखें।</p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <Link to="/about" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-800 transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"><FiUsers className="text-[#0D9488]" /> Village Story</Link>
                  <Link to="/gallery" className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-bold text-slate-800 transition hover:border-teal-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"><FiCompass className="text-[#0D9488]" /> Photo Gallery</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[#EAF5F4] py-16 dark:bg-[#112E37] sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading label="CELEBRATE TOGETHER" title="Village Events & Culture" description="त्योहार, खेल और समुदाय के यादगार आयोजन।" to="/news" action="Explore events" />
              <div className="grid gap-4 md:grid-cols-2">
                {eventNews.length ? eventNews.map((event) => (
                  <Link key={event.id} to="/news" className="group overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {event.image && <img src={event.image} alt="" loading="lazy" className="h-44 w-full object-cover" />}
                    <div className="p-6"><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300"><FiCalendar /> {event.date || 'Village Event'}</span><h3 className="mt-2 text-xl font-extrabold">{event.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.desc || 'Community event information'}</p></div>
                  </Link>
                )) : (
                  <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-800"><FiCalendar className="mb-4 h-9 w-9 text-[#0D9488]" /><h3 className="text-xl font-extrabold">आने वाले आयोजन</h3><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">नए कार्यक्रमों की जानकारी यहाँ प्रकाशित होगी।</p><Link to="/khel-registration" className="mt-5 inline-flex items-center gap-2 font-bold text-[#0D7195]">Sareri Khel Utsav <FiArrowRight /></Link></div>
                )}
                {eventNews.length < 2 && <div className="relative min-h-56 overflow-hidden rounded-3xl bg-[#0D477A] p-8 text-white"><div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-400/20" /><FiHeart className="h-10 w-10 text-teal-200" /><h3 className="relative mt-7 text-2xl font-extrabold">हमारी संस्कृति, हमारी शान</h3><p className="relative mt-3 max-w-sm text-sm leading-6 text-sky-100">समुदाय से जुड़ी गतिविधियाँ और गाँव की खास परंपराएँ।</p><Link to="/community" className="relative mt-5 inline-flex items-center gap-2 font-bold text-teal-200">Explore community <FiArrowRight /></Link></div>}
              </div>
            </div>
          </section>

          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid overflow-hidden rounded-[2rem] bg-[#0D477A] text-white lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-7 sm:p-10 lg:p-14">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-teal-200"><FiShoppingBag /> BUSINESS DIRECTORY • COMING SOON</span>
                  <h2 className="mt-5 text-3xl font-extrabold sm:text-4xl">हर स्थानीय दुकान की डिजिटल पहचान।</h2>
                  <p className="mt-4 max-w-xl leading-7 text-sky-100">भविष्य में दुकानों को अपना प्रोफाइल लिंक, keyword search, customer reviews और Directions मिलेंगे।</p>
                  <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-white/10 px-3 py-2">Shop profiles</span>
                    <span className="rounded-full bg-white/10 px-3 py-2">Ratings & reviews</span>
                    <span className="rounded-full bg-white/10 px-3 py-2">Map directions</span>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-white/10 p-7 sm:p-10">
                  <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-slate-900 shadow-xl">
                    <div className="flex items-center gap-3"><span className="rounded-xl bg-teal-100 p-3 text-teal-700"><FiShoppingBag className="h-6 w-6" /></span><div><p className="font-extrabold">Your Business Profile</p><p className="text-xs text-slate-500">Sareri Digital • Preview</p></div></div>
                    <div className="mt-5 rounded-xl bg-slate-100 p-3 text-xs font-semibold text-[#0D477A]">villagesareri.in/yourshop</div>
                    <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">Search keywords</span><span className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">Customer reviews</span></div>
                    <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] py-3 text-sm font-bold text-white"><FiMapPin /> Directions preview</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white py-16 dark:bg-slate-900/50 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading label="PEOPLE OF SARERI" title="Village Achievers" description="शिक्षा, खेल और समाज सेवा में गाँव का नाम रोशन करने वाले लोग।" to="/pride" action="See all achievers" />
              {achievers.length ? <div className="grid gap-4 md:grid-cols-3">{achievers.map((person) => <Link key={person.id} to="/pride" className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5 transition hover:border-teal-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">{person.image ? <img src={person.image} alt={person.name || ''} className="h-16 w-16 shrink-0 rounded-2xl object-cover" loading="lazy" /> : <span className="rounded-2xl bg-amber-100 p-4 text-amber-700"><FiAward className="h-7 w-7" /></span>}<span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-300">{person.category || 'Achievement'}</span><span className="mt-1 block font-extrabold">{person.name}</span><span className="mt-1 block line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{person.title || person.desc}</span></span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700"><FiAward className="mx-auto h-10 w-10 text-amber-500" /><p className="mt-3 font-bold">गाँव की उपलब्धियों की कहानियाँ यहाँ दिखेंगी।</p><Link to="/pride" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-700 dark:text-teal-300">Pride of Sareri <FiArrowRight /></Link></div>}
            </div>
          </section>

          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-[2rem] bg-[#E5F5F3] p-8 dark:bg-[#12363B] md:flex-row md:items-center md:justify-between md:p-10">
              <div className="flex items-start gap-4"><span className="rounded-2xl bg-teal-100 p-4 text-teal-700 dark:bg-teal-900"><FiMessageSquare className="h-7 w-7" /></span><div><h2 className="text-2xl font-extrabold">आपकी आवाज़, हमारा गाँव</h2><p className="mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">सुझाव साझा करें या अपने क्षेत्र की समस्या दर्ज करके उसकी स्थिति देखें।</p></div></div>
              <Link to="/complaint" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-[#0D9488] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#0F766E]"><FiCheckCircle /> Submit a Complaint</Link>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <details className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <summary className="cursor-pointer px-6 py-5 text-base font-extrabold text-[#0D477A] dark:text-teal-200">More from Sareri — Khel Utsav, community poll & virtual tour</summary>
              <div className="border-t border-slate-100 dark:border-slate-700"><CountdownWidget /><KhelBanner /><PollWidget /><VirtualTourBanner /></div>
            </details>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;
