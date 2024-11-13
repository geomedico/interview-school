import { Module, Logger } from '@nestjs/common';
import { PDFService } from './pdf.service';

@Module({
  imports: [],
  providers: [PDFService, Logger],
  exports: [PDFService],
})
export class PDFModule {}
