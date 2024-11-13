import { Injectable, Logger } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { StudentEntity } from './../../postgres/pg-models/student.entity';

@Injectable()
export class PDFService {
  constructor(private logger: Logger) { }
  async generateSchedulePDF(student: StudentEntity): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();

      page.drawText(`Schedule for ${student.name}`, { x: 50, y: 750 });

      let yPosition = 700;
      student.sections.forEach((section, index) => {
        const sectionText = `${index + 1}. ${section.subject.name} (${section.startTime} - ${section.endTime}), Teacher: ${section.teacher.name}, Classroom: ${section.classroom.roomNumber}`;
        page.drawText(sectionText, { x: 50, y: yPosition });
        yPosition -= 20;
      });

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);

    } catch (e) {
      this.logger.error(e);
    }
  }
}
