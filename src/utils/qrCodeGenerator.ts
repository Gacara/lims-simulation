import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import type { Sample } from '../types';

export interface QRCodeData {
  sampleId: string;
  laboratoryId: string;
  timestamp: number;
  type: 'sample';
}

export class QRCodeGenerator {
  /**
   * Generate a unique QR code for a sample
   */
  static async generateSampleQR(sample: Sample, laboratoryId: string): Promise<string> {
    const qrData: QRCodeData = {
      sampleId: sample.id,
      laboratoryId,
      timestamp: Date.now(),
      type: 'sample'
    };

    const qrString = JSON.stringify(qrData);
    
    try {
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR Code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate a unique sample ID
   */
  static generateSampleId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = uuidv4().split('-')[0];
    return `SAMPLE-${timestamp}-${randomPart}`.toUpperCase();
  }

  /**
   * Validate and parse QR code data
   */
  static parseQRCode(qrString: string): QRCodeData | null {
    try {
      const data = JSON.parse(qrString) as QRCodeData;
      
      // Validate required fields
      if (!data.sampleId || !data.laboratoryId || !data.timestamp || data.type !== 'sample') {
        return null;
      }

      // Check if QR code is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (Date.now() - data.timestamp > maxAge) {
        throw new Error('QR code has expired');
      }

      return data;
    } catch (error) {
      console.error('QR Code parsing failed:', error);
      return null;
    }
  }

  /**
   * Generate QR code for printing (SVG format)
   */
  static async generatePrintableQR(sample: Sample, laboratoryId: string): Promise<string> {
    const qrData: QRCodeData = {
      sampleId: sample.id,
      laboratoryId,
      timestamp: Date.now(),
      type: 'sample'
    };

    const qrString = JSON.stringify(qrData);
    
    try {
      // Generate QR code as SVG for better print quality
      const qrCodeSVG = await QRCode.toString(qrString, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 200
      });

      return qrCodeSVG;
    } catch (error) {
      console.error('Printable QR Code generation failed:', error);
      throw new Error('Failed to generate printable QR code');
    }
  }
}

/**
 * Sample QR code utility functions
 */
export const sampleQRUtils = {
  /**
   * Create a complete sample with QR code
   */
  async createSampleWithQR(
    sampleData: Omit<Sample, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>,
    laboratoryId: string
  ): Promise<Sample> {
    const sampleId = QRCodeGenerator.generateSampleId();
    const qrCode = await QRCodeGenerator.generateSampleQR(
      { ...sampleData, id: sampleId } as Sample,
      laboratoryId
    );

    const sample: Sample = {
      ...sampleData,
      id: sampleId,
      qrCode,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return sample;
  },

  /**
   * Validate scanned QR code and return sample ID
   */
  validateScannedQR(qrString: string, expectedLaboratoryId: string): string | null {
    const qrData = QRCodeGenerator.parseQRCode(qrString);
    
    if (!qrData) {
      return null;
    }

    if (qrData.laboratoryId !== expectedLaboratoryId) {
      throw new Error('QR code belongs to a different laboratory');
    }

    return qrData.sampleId;
  }
};
</btml:utils>