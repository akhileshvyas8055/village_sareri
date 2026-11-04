import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCompass, FiHome, FiShoppingBag } from 'react-icons/fi';
import SEO from '../components/SEO';

const NotFoundPage = ({
  title = 'यह पेज नहीं मिला',
  message = 'शायद पता गलत टाइप हुआ है या यह पेज अब उपलब्ध नहीं है। आप गाँव के मुख्य पन्ने से फिर शुरू कर सकते हैं।',
  showBusinessDirectory = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/');
  };

  return (
    <main className="relative isolate flex min-h-[72vh] items-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-4 py-12 dark:from-[#071610] dark:via-[#0B1120] dark:to-[#1c130b] sm:min-h-[78vh] sm:px-6">
      <SEO
        title="404 | पेज नहीं मिला - Village Sareri"
        description="यह पेज उपलब्ध नहीं है। गाँव के मुख्य पन्ने या स्थानीय दुकानों की सूची पर लौटें।"
        noindex={true}
      />

      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/25 blur-3xl dark:bg-emerald-500/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl dark:bg-orange-500/10" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
        <section className="text-center md:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-slate-900/70 dark:text-emerald-300">
            <FiCompass className="h-4 w-4" /> Village Sareri · 404
          </span>
          <div className="mt-5 bg-gradient-to-r from-emerald-800 via-[#135334] to-orange-500 bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent sm:text-8xl md:text-9xl">
            404
          </div>
          <h1 className="mt-4 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:mx-0 sm:text-base">
            {message}
          </p>
          <p className="mt-3 break-all font-mono text-xs text-slate-400 dark:text-slate-500">
            {location.pathname}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <FiArrowLeft className="h-4 w-4" /> पिछला पेज
            </button>
            {showBusinessDirectory && (
              <Link
                to="/businesses"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#135334] px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#0f4229] active:scale-[0.98]"
              >
                <FiShoppingBag className="h-4 w-4" /> सभी दुकानें देखें
              </Link>
            )}
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-5 text-sm font-bold text-orange-800 transition hover:bg-orange-100 active:scale-[0.98] dark:border-orange-900/70 dark:bg-orange-950/30 dark:text-orange-200 dark:hover:bg-orange-950/50"
            >
              <FiHome className="h-4 w-4" /> होम पेज
            </Link>
          </div>
        </section>

        <div aria-hidden="true" className="relative mx-auto hidden h-72 w-full max-w-sm items-center justify-center md:flex">
          <div className="absolute h-56 w-56 rounded-full border border-dashed border-emerald-300 dark:border-emerald-800" />
          <div className="absolute h-72 w-72 rounded-full border border-orange-200/80 dark:border-orange-900/50" />
          <div className="relative grid h-40 w-40 place-items-center rounded-[2rem] border border-white/80 bg-white/85 shadow-2xl shadow-emerald-900/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
            <FiCompass className="h-20 w-20 text-emerald-700 dark:text-emerald-300" strokeWidth={1.2} />
            <span className="absolute -right-5 -top-5 grid h-14 w-14 place-items-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-lg shadow-orange-900/20">?</span>
          </div>
          <span className="absolute bottom-4 left-3 rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-emerald-200">
            रास्ता नहीं मिला
          </span>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
