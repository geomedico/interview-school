import { Test, TestingModule } from '@nestjs/testing';
import { PDFDocument } from 'pdf-lib';
import { Logger } from '@nestjs/common';

import { PDFService } from './pdf.service';
import { StudentEntity } from './../../postgres/pg-models/student.entity';

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(),
  },
}));

describe('PDFService', () => {
  let pdfService: PDFService;
  let mockLogger: Logger;

  beforeEach(async () => {
    mockLogger = { error: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PDFService,
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    pdfService = module.get<PDFService>(PDFService);
  });

  it('should be defined', () => {
    expect(pdfService).toBeDefined();
  });

  describe('generateSchedulePDF', () => {
    it('should generate a PDF buffer for a student', async () => {
      // Mock the PDF document creation
      const mockPDFDoc = {
        addPage: jest.fn().mockReturnValue({
          drawText: jest.fn(),
        }),
        save: jest.fn().mockResolvedValue(Buffer.from('mocked-pdf-content')),
      };
      (PDFDocument.create as jest.Mock).mockResolvedValue(mockPDFDoc);

      // Mock the student entity
      const mockStudent: StudentEntity = {
        name: 'John Doe',
        sections: [
          {
            subject: { name: 'Math' },
            startTime: '08:00',
            endTime: '09:00',
            teacher: { name: 'Dr. Smith' },
            classroom: { roomNumber: '101' },
          },
          {
            subject: { name: 'Physics' },
            startTime: '09:30',
            endTime: '10:30',
            teacher: { name: 'Dr. Brown' },
            classroom: { roomNumber: '102' },
          },
        ],
      } as any;

      const result = await pdfService.generateSchedulePDF(mockStudent);

      expect(PDFDocument.create).toHaveBeenCalled();
      expect(mockPDFDoc.addPage).toHaveBeenCalled();
      expect(mockPDFDoc.save).toHaveBeenCalled();
      expect(result).toEqual(Buffer.from('mocked-pdf-content'));
    });

    it('should log an error if PDF generation fails', async () => {
      (PDFDocument.create as jest.Mock).mockImplementation(() => {
        throw new Error('PDF creation failed');
      });

      const mockStudent: StudentEntity = {
        name: 'John Doe',
        sections: [],
      } as any;

      const result = await pdfService.generateSchedulePDF(mockStudent);

      expect(mockLogger.error).toHaveBeenCalledWith(expect.any(Error));
      expect(result).toBeUndefined();
    });
  });
});
