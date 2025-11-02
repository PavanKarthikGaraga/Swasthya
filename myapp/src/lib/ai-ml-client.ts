import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types based on ML project
export interface DiagnosisRequest {
  symptoms: string[];
  patientId?: string;
  imageUrl?: string;
  imageBase64?: string;
  description?: string;
}

export interface DiagnosisResponse {
  suggestions: DiagnosisSuggestion[];
  pastRecords?: BlockWithAnalysis[];
  confidence: number;
  analysis: string;
}

export interface DiagnosisSuggestion {
  condition: string;
  probability: number;
  description?: string;
  recommendations?: string[];
}

export interface BlockWithAnalysis {
  block: any;
  relevance: number;
  relevanceReason: string;
}

export interface ImageAnalysisRequest {
  imageUrl?: string;
  imageBase64?: string;
  patientId?: string;
}

export interface ImageAnalysisResponse {
  diagnosis: string;
  conditions: string[];
  confidence: number;
  findings: string[];
  recommendations?: string[];
}

/**
 * Client for communicating with the AI/ML service
 * Connects to the Swarthya-blockchain-ML project
 */
export class AIMLClient {
  private client: AxiosInstance;
  private mlServiceUrl: string;

  constructor() {
    this.mlServiceUrl = process.env.NEXT_PUBLIC_ML_SERVICE_URL || process.env.ML_SERVICE_URL || 'http://localhost:4000';

    this.client = axios.create({
      baseURL: this.mlServiceUrl,
      timeout: 30000, // 30 seconds timeout for AI processing
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('AI/ML Service Error:', error.message);
        if (error.response) {
          throw new Error(`AI/ML Service Error: ${error.response.data?.error || error.message}`);
        }
        throw new Error(`AI/ML Service Unavailable: ${error.message}`);
      }
    );
  }

  /**
   * Get diagnosis based on symptoms and optional patient history
   */
  async diagnose(
    symptomsOrRequest: string[] | DiagnosisRequest,
    patientId?: string,
    description?: string
  ): Promise<DiagnosisResponse> {
    try {
      const request: DiagnosisRequest = Array.isArray(symptomsOrRequest)
        ? { symptoms: symptomsOrRequest, patientId, description }
        : symptomsOrRequest;

      const response = await this.client.post('/ai/diagnose', request);
      if (response.data.success && response.data.diagnosis) {
        return response.data.diagnosis;
      } else {
        throw new Error('Invalid response format from ML service');
      }
    } catch (error: any) {
      console.error('Diagnosis request failed:', error.message);
      throw new Error(`Diagnosis failed: ${error.message}`);
    }
  }

  /**
   * Analyze medical image (X-ray, CT scan, etc.)
   */
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    try {
      const response = await this.client.post('/ai/analyze-image', request);
      if (response.data.success && response.data.analysis) {
        return response.data.analysis;
      } else {
        throw new Error('Invalid response format from ML service');
      }
    } catch (error: any) {
      console.error('Image analysis request failed:', error.message);
      throw new Error(`Image analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze symptoms with text description
   */
  async analyzeSymptoms(symptoms: string[], description?: string): Promise<DiagnosisResponse> {
    return this.diagnose({
      symptoms,
      description
    });
  }

  /**
   * Get blockchain records for a patient (for context in diagnosis)
   */
  async getPatientRecords(patientId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/records/patient/${patientId}`);
      if (response.data.success && response.data.records) {
        return response.data.records;
      } else {
        return [];
      }
    } catch (error: any) {
      console.warn('Failed to fetch patient blockchain records:', error.message);
      return []; // Return empty array if blockchain service is unavailable
    }
  }

  /**
   * Upload medical record file to blockchain backend
   */
  async uploadMedicalRecord(
    file: File,
    patientId: string,
    metadata: any = {},
    labels: string[] = ['healthcare'],
    tags: string[] = ['medical_record']
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', patientId);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('labels', JSON.stringify(labels));
      formData.append('tags', JSON.stringify(tags));

      const response = await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: any) {
      console.error('Failed to upload medical record:', error.message);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Store medical record metadata in blockchain (without file upload)
   */
  async storeMedicalRecord(
    patientId: string,
    fileId: string,
    filename: string,
    metadata: any = {}
  ): Promise<any> {
    try {
      const response = await this.client.post('/blockchain/store', {
        patientId,
        fileId,
        filename,
        metadata,
        tags: ['medical_record'],
        labels: ['healthcare']
      });
      if (response.data.success) {
        return response.data;
      } else {
        return null;
      }
    } catch (error: any) {
      console.warn('Failed to store record in blockchain:', error.message);
      return null; // Don't fail the main operation if blockchain storage fails
    }
  }

  /**
   * Verify medical record integrity using blockchain
   */
  async verifyMedicalRecord(fileId: string): Promise<any> {
    try {
      const response = await this.client.get(`/verify/file/${fileId}`);
      return response.data;
    } catch (error: any) {
      console.warn('Failed to verify medical record:', error.message);
      return null;
    }
  }

  /**
   * Check if ML service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.client.get('/chain'); // Simple health check
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const aiMLClient = new AIMLClient();
