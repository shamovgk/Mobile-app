import apiClient from '../client';

export const dictionaryApi = {
  getPackDictionary: async (packId: string) => {
    const response = await apiClient.get(`/progress/dictionary/pack/${packId}`);
    return response.data;
  },
};