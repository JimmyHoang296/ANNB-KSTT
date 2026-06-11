import { createContext, useContext, useState, useCallback } from 'react';
import { getData } from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getData();
      if (res.success) setData(res.data || []);
      else setError(res.message || 'Không thể tải dữ liệu');
    } catch (err) {
      setError('Lỗi kết nối: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => setData(null), []);

  return (
    <DataContext.Provider value={{ data, loading, error, refresh, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
