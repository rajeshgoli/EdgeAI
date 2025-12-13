import { PriceLevel } from '../../types';

export const useAnalyze = () => {
    // TODO: Connect to Python Backend later
    // For now, return mock Goldbach levels after 1 second delay
    return new Promise<PriceLevel[]>(resolve => setTimeout(() => resolve([
        { price: 4150.0, color: 'rgba(239, 68, 68, 1)', title: 'OB' },
        { price: 4120.0, color: 'rgba(34, 211, 238, 1)', title: 'FVG' }
    ]), 1000));
};
