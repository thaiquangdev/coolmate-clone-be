import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService], // Đảm bảo `MailService` có thể được sử dụng bởi các module khác
})
export class MailModule {}
