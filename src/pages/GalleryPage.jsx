import Gallery from '../sections/Gallery';
import SEO from '../components/SEO';

const GalleryPage = () => {
  const dharmikTalabLinks = [
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFOdLUg82fDJrjBUxYGC4qus-_-xE_MLQoxw_1b-cJIWO-vbN1f-VEMfT7TFn6aIVAqBSBwyXF4uhnA8_fhNdEDP1Te00jfqjAO7Z0xoBcxjVoTRchsX_QBzuLHqPZS008IbwokesnKA1nl=w1080", title: "Dharmik Talab View 1" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHbC2-mPvAalK9hYOZBmHFUP5aeiHvDMIO786CKEntzICby61xSU-8cx1JDQJYGsfFMTdSXDEb8iFiFrGHpix4RD2DO6lsQHNRqrD9U8C8IHClK451h3XVQp6zvAfhFCSwK5OXT3Q0sMrPL=w1080", title: "Dharmik Talab View 2" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFBJ85p0R3KjQqdzm7w6MZMmTenBvWZtV4tg4YG67LQczqO7h1594mlAhgO85H_FcZVetnDsM7JIR2IjA9NU6sMGXw-iBiMYtqNYZmE4tvGbo_MuDJTuMAwXthhUHR4jielgoE=w1080", title: "Dharmik Talab View 3" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFWUTw8-GPv95VlJANBOUT4P24LRFchmx4NyO3DW5Z8uHxFNLQJyplYGs2sU2Rm1ue3hDw-tJyKguHiIvrDclR1ONOTzzJW1ugVNg9-BxX3grGW4yHllhwt5TA7XPx6xJzL9Di7=w1080", title: "Dharmik Talab View 4" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFypNiW2Q8VkqX89yz4TNNTcpcoyTqH5bPewf0Ykghbakl-6Vy3DcO5hY2mNDUp-jdQlMysIqBIhnvA8xlAxF8tidoJMZXMN8Q_M8UHm5Jv02SfS2T1Onpg59iq0nuCOVItyRg=w1080", title: "Dharmik Talab View 5" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEcBcVhEWPMJNHrABhXpApY5nd7e5e53MJ2bmQKsU-9ZYpnh2QWd-GYmvS6QdP8ScPJ8jbEzsFqaPqXyrie8daPyZCwUhvMm0eNDdKU58My4DILFrCE2xsBrM41ub9cw90NOsBJ=w1080", title: "Dharmik Talab View 6" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEYJJb6-5YLeFIblbcAcMw4fMTcHwGn3XSsLQPkU603uks6_bUjrW7HNZoS79kHbVOmxHXGdvubrgA2E62HF480pwLfeBC2pYh-V_httIx1Zxf0k1fqWEkaFjOIQ-l5m6nuj7mZGg=w1080", title: "Dharmik Talab View 7" }
  ];

  const gausalaLinks = [
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAG6ipB6ZMVjvyEN9ok7t7tU-4RUvWPihCQXDnZVFalR_SdjuC0l2q58n2Tef4n72ucSoZIHHAvJ-e8zg6etmdlWvetc5Bh097Y_5NUZkD0uYj_ugDk3B7sdA_G-ObbL6icgJy8mLw=w1080", title: "Bajrang Gopal Goshala 1" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFqz6NJqLC7Ar8lq4dguUOsWfumYehYiVccfUHcnu3mmwizkohee-MPGxp4zTZAwYwnIwUYXmhCuw5nKT1bfOPg-yi9ntiIWkRxYbqbHfnBQikhFOcCPwCLylJ0TSMfmC2TipylvSGsHIQ=w1080", title: "Bajrang Gopal Goshala 2" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFPAMzlhIpJI_xnoQ40ZlPBnM6TdyGPyrxDuN_2bNZ457GlhtN7Hnu_e96q_ghcl1dn4Tc6VF0k3dLFME19aCXokn3PVjms9dklBQdkuxwiVsP7xyDQ_MRMGihcnXFjn_LBtw36CL63W9ol=w1080", title: "Bajrang Gopal Goshala 3" }
  ];

  const schoolLinks = [
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAFpTgLnkTU27Qmiwcr3Svd63bBb7iqWSspPlwHQzFzhkXgBoVAcLycOiNIS6gX97KMqlZWjDn8sENJsUiSs8AP779Vz-R7-RQ-uMH1So-HCRfAn-PUR4Qwq0m_0ssN7swVLa4iAbA=w1080", title: "KGBV View 1" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGaWawPBRR6hf8XfPKvO3RYctk5ixBnRvbBck2YrUr2KPI8NydF-LLdcSMlMvS8tM7gDaxuVtTTGjo6P0kFj3VM4VSWDIrnRGg9tjsXrVBBOrfu67fMLGkH6jnN_fPmJnlafNaqtw=w1080", title: "KGBV View 2" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAH4TSgWFc4vKY-Te8Yi74QFwPOuM5-DE5OqLSdKz2YznF3h9kHcrK2DHjajv2B16Pex6KBTjnVrQ08SEiJBZdosbWHfjj2Nl_XurY70-QqtQDEinx1AwHcVgXlG76cs6JuC-eUo=w1080", title: "KGBV View 3" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAExnfvO6wnbdu9NqxAIXOldXcco6KL097pYSpogsHaJolr0jcbSa2AI_kdDsFwZEHTwhJ18N5o7IXjzexbIu_xKhpP_ikxF1LFDgG9HYZAasQSSMqtSK79DhUl9W8zGzCxIUpQ=w1080", title: "KGBV View 4" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHguDPfwgsl-Tzi1ojQh6_wAg9wJedyN5_kI3WgxhZwBQZ_4S1XRdCAMM5sTvJz7oDEokNEim4CgoHsnij6XutaHtLBrmN02mUXNpdqj7k1fxDYR2NUaRNymOGHmuXCrW4r-e-S=w1080", title: "KGBV View 5" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAEWR4R3nZp4j5vn4QrPxzfg10eYkhHbu3G_bxXyC_UEmljVkl_lsiVtbK8T31HgybgQ06gMsmbcme64Kuj15zDxn-MGkSqCKsW9s-Vyswclt_ms5zfo3cmHIC7ak_8QEu84jvqU0g=w1080", title: "KGBV View 6" }
  ];

  const templeLinks = [
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAHSOykp9RXLtqBONdvtVa_Wuy-NVnvCL-gfCp582DtWy6yWTUw9hp4glzVi7I4ZU3YRJO8OzrelTT-3kvbhQktxF0oPkC1qMEsT1SmKtEj20zCKnVdBLTIPsJVlPuWTaI_dbmg=w1080", title: "Temple View 1" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAER_l99Ww7xtevdmdNetpWeRLHLSs-WgiwwZNDxr1VnEeWdPsG8zmlYMV4qScDTbDH4CFwRPl4Ra-6dn0t4pvcmCVwDhw7fhLFz7-xVZU0fir1iKIB4TZLqxknE6Rn4LhJ_AcYo=w1080", title: "Temple View 2" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGgAPFGxMNUFYvcgA1X3JguExwXsbY2rfd5oxXKQDQNIxPKMPMH0dAKnRXwHJS7DqzIl-1xuv4xCO-KZnlgaglCtiKdKkPTSu9KKn2h58mtM80Flr7dp2ZJ2CpUMbDJ5unDBGtO=w1080", title: "Temple View 3" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGaEBjQUBkb_z_F22VStFJaZ0Y34lNhLjUJZ0Uj-yAxz2VfIoIwHvhuN5hWXtMu9g4loEU0LbZMzIuSphQPwrQ65YeFts_MrJk75ZgvBWrG3c2FHi8KB5vaYpRBlNXZuvltjls=w1080", title: "Temple View 4" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAE_jJ6ChUStUBt5X6GO2pfCagSyOA8tjOFur7NZKGd4IOIbyTSSuygZTbJ9zWFvtzJFxmGQ4_2vf5eRqeuS5InSBJiDhG12sYExtD-iMtef6QW5bd4kmMijJuFzE-0SzdX4YnJK4d1v7Bg=w1080", title: "Temple View 5" },
    { src: "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGVzp8NFI8ueTDbXLHFSl0KYwLQHPSxd3__JDuNlS4nPO6FrJotA5mOHRGVQbyq_8PVWChuF6ct3g_7DZRl7sieyuU8A9_f15C34MvIRtTbGR7lIl3SiouAH8OERQcTFTbAuWhx=w1080", title: "Temple View 6" }
  ];

  return (
    <div className="pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen notranslate">
      <SEO 
        title="Gallery - Brahmano Ki Sareri Village Photos & Videos"
        description="Brahmano Ki Sareri ki photo gallery. Ramleela, Mela Purnima, Khel Mahotsav, temples aur gaon ke sundar nazaron ki tasveerein."
        url="https://villagesareri.in/gallery"
      />
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
      <Gallery title="Sacred Temples" folder="mandir" description="Our beautiful historic temples and spiritual core." externalLinks={templeLinks} />
      <Gallery title="Bajrang Gopal Goshala" folder="gausala" description="Our beloved cattle and the vibrant Goshala of the village." externalLinks={gausalaLinks} />
      <Gallery title="Village Schools" folder="school" description="Glimpses of education and learning in our village." externalLinks={schoolLinks} />
      <Gallery title="Dharmik Talab" folder="pond" description="The serene water bodies and natural beauty of our village." externalLinks={dharmikTalabLinks} />
      <Gallery title="Ramleela Mahotsav" folder="ramlila" description="Over 50 years of rich cultural heritage where locals perform the epic of Ramayana." />
      <Gallery title="Mela Purnima" folder="mela" description="Glimpses from the sacred Mela Purnima celebrations and gatherings." />
      <Gallery title="Khel Mahotsav" folder="khelmhautsav" description="Glimpses from the exciting village sports festival." />
      <Gallery title="Jaljulni Ekadashi" folder="jaljulni" description="Sacred Jaljulni Ekadashi celebrations and processions in our village." />
    </div>
  );
};

export default GalleryPage;
