import { Prediction } from '../types';

/**
 * MOCK PREDICTION SERVICE
 * -------------------
 * This layer abstracts data fetching to make future API integration seamless.
 * 
 * TO REVERT/UPDATE: Replace mock returns with real 'api.post()' calls.
 */

// TODO: Replace with API call to /predictions
export const submitPredictions = async (predictions: Record<string, Prediction>): Promise<void> => {
  console.log('Submitting predictions to backend...', predictions);
  await new Promise(resolve => setTimeout(resolve, 1000));
};
