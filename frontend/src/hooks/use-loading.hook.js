import { useContext } from 'react';
import { LoadingContext } from '../providers/loading.provider';

export const useLoading = () => useContext(LoadingContext);
