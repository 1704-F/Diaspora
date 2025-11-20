import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const emailProvider = configService.get('EMAIL_PROVIDER', 'smtp');

        // Base configuration
        const baseConfig = {
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
          defaults: {
            from: `"${configService.get('EMAIL_FROM_NAME', 'Diaspora Platform')}" <${configService.get('EMAIL_FROM', 'noreply@diaspora-platform.com')}>`,
          },
        };

        // SendGrid configuration
        if (emailProvider === 'sendgrid') {
          return {
            ...baseConfig,
            transport: {
              host: 'smtp.sendgrid.net',
              port: 587,
              secure: false,
              auth: {
                user: 'apikey',
                pass: configService.get('SENDGRID_API_KEY'),
              },
            },
          };
        }

        // SMTP configuration (default)
        return {
          ...baseConfig,
          transport: {
            host: configService.get('SMTP_HOST', 'localhost'),
            port: configService.get('SMTP_PORT', 587),
            secure: configService.get('SMTP_SECURE', 'false') === 'true',
            auth: {
              user: configService.get('SMTP_USER'),
              pass: configService.get('SMTP_PASS'),
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
