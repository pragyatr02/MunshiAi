import api from './api';
import { VoiceProcessResponse } from '../types';

export const voiceService = {
  async processVoiceInput(
    data: Blob | File | { text: string } | FormData
  ): Promise<VoiceProcessResponse> {

    // ---------------------------------------------------------
    // Existing FormData
    // ---------------------------------------------------------

    if (data instanceof FormData) {
      const response = await api.post<VoiceProcessResponse>(
        '/voice/transcribe',
        data
      );

      return response.data;
    }

    // ---------------------------------------------------------
    // Audio Blob / File
    // ---------------------------------------------------------

    if (data instanceof Blob || data instanceof File) {
      const formData = new FormData();

      formData.append(
        'file',
        data,
        'voice_recording.webm'
      );

      const response = await api.post<VoiceProcessResponse>(
        '/voice/transcribe',
        formData
      );

      return response.data;
    }

    // ---------------------------------------------------------
    // Browser speech-recognition text
    // ---------------------------------------------------------

    const formData = new FormData();

    formData.append(
      'text',
      data.text
    );

    const response = await api.post<VoiceProcessResponse>(
      '/voice/transcribe',
      formData
    );

    return response.data;
  },

  async getVoiceById(
    id: string | number
  ): Promise<VoiceProcessResponse> {
    const response = await api.get<VoiceProcessResponse>(
      `/voice/${id}`
    );

    return response.data;
  },
};

export default voiceService;