import fs from "fs";
import handlebars from "handlebars";
import type { SendMailOptions, SentMessageInfo, Transporter } from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import { IS_PROD } from "../config/constant.config.js";
import { env } from "../config/env.config.js";
import transporter from "../lib/transporter.js";
import { logger } from "../middleware/logger.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = IS_PROD
  ? path.resolve(__dirname, "templates")
  : path.resolve(__dirname, "..", "templates");

if (!fs.existsSync(TEMPLATES_DIR)) {
  throw new Error(`Email templates directory not found: ${TEMPLATES_DIR}`);
}

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = transporter;
  }

  private getBaseTemplateData() {
    return {
      appName: env.APP_NAME || "Smooth Shuttle",
      companyAddress: "6 Olusoji Idowu St, Ilupeju 100261, Lagos",
      year: new Date().getFullYear(),
      supportEmail: env.EMAIL_REPLY_TO,
      supportLink: `mailto:${env.EMAIL_REPLY_TO}`,
    };
  }

  private static loadTemplate(templateName: string, data: object): string {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
    const templateSource = fs.readFileSync(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(templateSource);
    return compiledTemplate(data);
  }

  public async sendEmail({
    to,
    subject,
    text,
    html,
    from,
  }: SendMailOptions): Promise<SentMessageInfo> {
    try {
      const mailOptions = {
        from:
          from || env.EMAIL_SENDER || "ICS Outsourcing <info@bcodestech.com>",
        replyTo: env.EMAIL_REPLY_TO || "support@hrcoreapp.com",
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error: unknown) {
      logger.fatal({ err: error }, "Error sending email:");
      throw error;
    }
  }

  public async sendOTPViaEmail(
    email: string,
    otp: string,
  ): Promise<SentMessageInfo> {
    const subject = "OTP Request";
    const date = new Date().toLocaleString();
    const emailText = `Hi there,\n\nYour OTP is: ${otp}`;

    const html = MailService.loadTemplate("otp-template", {
      ...this.getBaseTemplateData(),
      otp,
      date,
    });

    return await this.sendEmail({
      to: email,
      subject,
      text: emailText,
      html,
    });
  }
}

export const mailService = new MailService();
