import { createContext, useCallback, useState } from 'react';
import { Loading } from '../componentes/loading/loading.component';

export const LoadingContext = createContext({
  loading: false,
  openLoading: () => {},
  closeLoading: () => {},
});

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const openLoading = useCallback(() => setLoading(true), []);

  const closeLoading = useCallback(() => setLoading(false), []);

  return (
    <LoadingContext.Provider value={{ loading, openLoading, closeLoading }}>
      {loading ? <Loading /> : children}
    </LoadingContext.Provider>
  );
};
