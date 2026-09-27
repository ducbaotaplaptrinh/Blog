const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      console.log(`📧 Email Transporter configured with SMTP host: ${host}`);
    } else {
      console.log('ℹ️ SMTP chưa được cấu hình đầy đủ trong .env. Email sẽ chạy ở chế độ DEV Simulation (Console Logger).');
    }
  }

  // Tạo mẫu HTML Email bài viết mới phong cách Editorial
  generateNewPostHtml({ post, unsubscribeToken, siteUrl }) {
    const blogUrl = `${siteUrl}/blog/${post.slug}`;
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
    const postDate = new Date(post.published_at || Date.now()).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${post.title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                
                <!-- HEADER -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #090d16; border-bottom: 2px solid #6366f1;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">TECH<span style="color: #818cf8;">INSIGHT</span></span>
                          <span style="display: block; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Bản Tin Công Nghệ & Kiến Trúc Chuyên Sâu</span>
                        </td>
                        <td align="right">
                          <span style="font-size: 11px; color: #cbd5e1; background-color: rgba(99,102,241,0.2); padding: 4px 10px; border-radius: 20px; font-weight: 600;">ẤN BẢN MỚI</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- THUMBNAIL (NẾU CÓ) -->
                ${post.thumbnail ? `
                <tr>
                  <td style="padding: 0;">
                    <img src="${post.thumbnail.startsWith('http') ? post.thumbnail : `${siteUrl}${post.thumbnail}`}" alt="${post.title}" style="width: 100%; max-height: 280px; object-fit: cover; display: block;" />
                  </td>
                </tr>
                ` : ''}

                <!-- BODY -->
                <tr>
                  <td style="padding: 32px 32px 24px 32px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding-bottom: 12px;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6366f1; letter-spacing: 0.5px; background-color: #e0e7ff; padding: 3px 8px; border-radius: 4px;">
                            ${post.category_name || 'Công nghệ'}
                          </span>
                          <span style="font-size: 12px; color: #64748b; margin-left: 10px;">
                            ${postDate}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 16px;">
                          <h1 style="font-size: 22px; font-weight: 800; line-height: 1.35; color: #0f172a; margin: 0;">
                            ${post.title}
                          </h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 28px;">
                          <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                            ${post.summary || 'Bài phân tích chuyên sâu mới vừa được xuất bản trên TechInsight. Khám phá những góc nhìn kiến trúc và kinh nghiệm thực chiến từ chuyên gia.'}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 16px;">
                          <a href="${blogUrl}" target="_blank" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                            Đọc Bài Viết Hoàn Chỉnh &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
                    <p style="margin: 0 0 8px 0;">
                      Bạn nhận được email này vì đã đăng ký theo dõi bản tin bài viết mới tại <strong>TechInsight Blog</strong>.
                    </p>
                    <p style="margin: 0;">
                      Nếu bạn không muốn tiếp tục nhận thông báo, bạn có thể 
                      <a href="${unsubscribeUrl}" target="_blank" style="color: #6366f1; text-decoration: underline;">hủy đăng ký tại đây</a> bất kỳ lúc nào.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  // Gửi một email thông báo bài mới
  async sendNewPostEmail({ toEmail, post, unsubscribeToken }) {
    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    const fromAddress = process.env.EMAIL_FROM || '"TechInsight Editorial" <editorial@techinsight.dev>';
    const subject = `[TechInsight] Bài viết mới: ${post.title}`;
    const html = this.generateNewPostHtml({ post, unsubscribeToken, siteUrl });

    if (!this.transporter) {
      // Simulation mode
      console.log(`📨 [EMAIL DEV SIMULATION] To: ${toEmail} | Subject: ${subject}`);
      return { success: true, simulated: true };
    }

    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`❌ Lỗi gửi email tới ${toEmail}:`, err.message);
      throw err;
    }
  }
}

module.exports = new EmailService();
