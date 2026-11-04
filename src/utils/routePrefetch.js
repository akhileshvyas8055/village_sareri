const routeLoaders = {
  '/complaint': () => import('../pages/ComplaintPage'),
  '/notices': () => import('../pages/NoticeBoardPage'),
  '/panchayat': () => import('../pages/Panchayat'),
  '/about': () => import('../pages/AboutPage'),
  '/community': () => import('../pages/CommunityPage'),
  '/businesses': () => import('../pages/BusinessDirectoryPage'),
  '/events': () => import('../pages/EventsPage'),
  '/pride': () => import('../pages/PridePage'),
};

const routePromises = new Map();

export const preloadRoute = (path) => {
  const loader = routeLoaders[path];
  if (!loader) return Promise.resolve();

  if (!routePromises.has(path)) {
    const routePromise = loader().catch((error) => {
      routePromises.delete(path);
      throw error;
    });
    routePromises.set(path, routePromise);
  }

  return routePromises.get(path);
};
