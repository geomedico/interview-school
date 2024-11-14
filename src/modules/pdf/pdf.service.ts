import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument, rgb } from 'pdf-lib';
import { StudentEntity } from './../../postgres/pg-models/student.entity';

@Injectable()
export class PDFService {
  constructor(private logger: Logger) {}
  async generateSchedulePDF(student: StudentEntity): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const fontSize = 14;
      const lineHeight = 24;
      let yPosition = 750;

      page.drawText(`Schedule for ${student.name}`, {
        x: 50,
        y: yPosition,
        size: 20,
        color: rgb(0, 0, 0),
      });

      yPosition -= 40;

      student.sections.forEach((section, index) => {
        const sectionText = `${index + 1}. ${section.subject.name} (${section.startTime} - ${section.endTime}), Teacher: ${section.teacher.name}, Classroom: ${section.classroom.roomNumber}`;

        page.drawText(sectionText, {
          x: 50,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });

        yPosition -= lineHeight;
      });

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
