const nodemailer = require('nodemailer');

// Configuración del transporter de email
// IMPORTANTE: Configura estas variables de entorno en producción
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Tu email
        pass: process.env.SMTP_PASS  // Tu contraseña de aplicación
    }
});

// Verificar conexión (opcional)
transporter.verify(function (error, success) {
    if (error) {
        console.log('⚠️  Email transporter error:', error.message);
        console.log('📧 Para habilitar emails, configura las variables de entorno SMTP_USER y SMTP_PASS');
    } else {
        console.log('✅ Email server is ready');
    }
});

/**
 * Enviar email de confirmación de registro
 */
async function sendRegistrationConfirmation(to, fullName) {
    if (!process.env.SMTP_USER) {
        console.log('⚠️  Email not sent (SMTP not configured):', to);
        return { success: false, message: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Terminales Misiones" <${process.env.SMTP_USER}>`,
            to: to,
            subject: 'Solicitud de Registro Recibida - Terminales Misiones',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1f2937;">¡Hola ${fullName}!</h2>
                    <p>Hemos recibido tu solicitud de registro para acceder al panel de administración de <strong>Terminales Misiones</strong>.</p>
                    <p>Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email cuando sea aprobada.</p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                        Si no solicitaste este registro, puedes ignorar este mensaje.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px;">
                        Terminales Misiones - Sistema de Gestión<br>
                        Este es un email automático, por favor no respondas a este mensaje.
                    </p>
                </div>
            `
        });

        console.log('✅ Registration confirmation sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending registration email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar email de aprobación con credenciales
 */
async function sendApprovalEmail(to, fullName, email, temporaryPassword) {
    if (!process.env.SMTP_USER) {
        console.log('⚠️  Email not sent (SMTP not configured):', to);
        return { success: false, message: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Terminales Misiones" <${process.env.SMTP_USER}>`,
            to: to,
            subject: '✅ Solicitud Aprobada - Acceso al Panel de Administración',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #10b981;">¡Tu solicitud ha sido aprobada!</h2>
                    <p>Hola <strong>${fullName}</strong>,</p>
                    <p>Tu solicitud de acceso al panel de administración de <strong>Terminales Misiones</strong> ha sido aprobada.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #1f2937;">Tus credenciales de acceso:</h3>
                        <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
                        <p style="margin: 10px 0;"><strong>Contraseña temporal:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${temporaryPassword}</code></p>
                    </div>

                    <p><strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</p>
                    
                    <a href="${process.env.APP_URL || 'http://localhost:8080'}/admin/login" 
                       style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                        Acceder al Panel
                    </a>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #9ca3af; font-size: 12px;">
                        Terminales Misiones - Sistema de Gestión<br>
                        Si tienes alguna pregunta, contacta al administrador.
                    </p>
                </div>
            `
        });

        console.log('✅ Approval email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending approval email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Enviar email de rechazo
 */
async function sendRejectionEmail(to, fullName, reason) {
    if (!process.env.SMTP_USER) {
        console.log('⚠️  Email not sent (SMTP not configured):', to);
        return { success: false, message: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"Terminales Misiones" <${process.env.SMTP_USER}>`,
            to: to,
            subject: 'Actualización sobre tu Solicitud de Registro',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ef4444;">Solicitud No Aprobada</h2>
                    <p>Hola <strong>${fullName}</strong>,</p>
                    <p>Lamentamos informarte que tu solicitud de acceso al panel de administración no ha sido aprobada en este momento.</p>
                    
                    ${reason ? `
                        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0;">
                            <p style="margin: 0;"><strong>Motivo:</strong> ${reason}</p>
                        </div>
                    ` : ''}

                    <p>Si crees que esto es un error o deseas más información, por favor contacta al administrador del sistema.</p>

                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #9ca3af; font-size: 12px;">
                        Terminales Misiones - Sistema de Gestión
                    </p>
                </div>
            `
        });

        console.log('✅ Rejection email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending rejection email:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendRegistrationConfirmation,
    sendApprovalEmail,
    sendRejectionEmail
};
