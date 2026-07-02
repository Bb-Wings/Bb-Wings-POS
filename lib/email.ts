import nodemailer from "nodemailer";

/**
 * @fileoverview Email Sender Utility â€” BB Wings Management System
 * @description Utilidad para enviar correos electrÃ³nicos de credenciales y notificaciones por SMTP.
 * @version 1.0.0
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true for 465, false for other ports (like 587)
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    rejectUnauthorized: false // Evitar errores por certificados self-signed o configuraciones locales
  }
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const mailOptions = {
    from: `"BB Wings Support" <${process.env.SMTP_USER || ""}>`,
    to,
    subject,
    html,
  };

  console.log(`[SMTP] Intentando enviar correo a: ${to}`);
  console.log(`[SMTP] Host: ${process.env.SMTP_HOST || ""}`);
  console.log(`[SMTP] Port: ${process.env.SMTP_PORT || "587"}`);
  console.log(`[SMTP] User: ${process.env.SMTP_USER || ""}`);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Correo enviado con Ã©xito. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[SMTP] Error detallado al enviar correo:`, error);
    throw error;
  }
}

/**
 * Genera una plantilla HTML profesional para enviar credenciales temporales.
 */
export function getCredentialsEmailTemplate(nombre: string, email: string, contrasenaTemporal: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0c0c; color: #ffffff; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #ea580c; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 2px;">BB WINGS</h1>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">GestiÃ³n de Cuentas</p>
      </div>
      
      <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 30px; border-radius: 10px;">
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #ffffff;">Â¡Hola, ${nombre}!</h2>
        <p style="font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6;">
          Se ha creado tu cuenta de usuario para ingresar al panel administrativo de <strong>BB Wings</strong>. A continuaciÃ³n, encontrarÃ¡s tus credenciales de acceso temporal:
        </p>
        
        <div style="background-color: rgba(234, 88, 12, 0.05); border-left: 4px solid #ea580c; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase; width: 100px;">Correo:</td>
              <td style="padding: 6px 0; font-size: 15px; color: #ffffff; font-weight: 600;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 14px; color: rgba(255,255,255,0.4); font-weight: 700; text-transform: uppercase;">ContraseÃ±a:</td>
              <td style="padding: 6px 0; font-size: 15px; color: #ea580c; font-weight: 700; font-family: monospace; letter-spacing: 1px;">${contrasenaTemporal}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.5; margin-bottom: 25px;">
          * Por motivos de seguridad, te recomendamos cambiar esta contraseÃ±a temporal una vez que inicies sesiÃ³n en tu perfil administrativo.
        </p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="background: linear-gradient(90deg, #d61f2c, #ea580c); color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: 700; border-radius: 8px; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.3);">
            Iniciar SesiÃ³n
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px;">
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin: 0;">
          Este es un correo automÃ¡tico. Por favor, no respondas a este mensaje.
        </p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 5px;">
          &copy; ${new Date().getFullYear()} BB Wings. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;
}
