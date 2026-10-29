import { createContext, useContext } from 'react';
import type { ClientImage } from '@/lib/clientImages';
export const ClientImageContext = createContext<ClientImage[]>([]);
export const useClientImages = () => useContext(ClientImageContext);