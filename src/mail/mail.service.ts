import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // cấu hình email
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'thaiquangqt2003@gmail.com',
        pass: 'zjfx cxnw eppy ojmd',
      },
    });
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    const mailOptions = {
      from: 'your-email@gmail.com', // Email người gửi
      to: email, // Email người nhận
      subject: 'Mã xác thực OTP của bạn',
      text: `Mã OTP của bạn là: ${otp}`,
      html: `<p>Mã OTP của bạn là: <b>${otp}</b></p>`, // HTML định dạng email
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMailForgotPassword(email: string, token: string): Promise<void> {
    const mailOptions = {
      from: 'your-email@gmail.com', // Email người gửi
      to: email, // Email người nhận
      subject: 'Quên mật khẩu',
      html: `<a href="}
      http://localhost:5173/reset-password/${token}">Nhấn vào link này để tới trang nhập lại mật khẩu của bạn</a>`, // HTML định dạng email
    };
    await this.transporter.sendMail(mailOptions);
  }
}

export default MailService;
