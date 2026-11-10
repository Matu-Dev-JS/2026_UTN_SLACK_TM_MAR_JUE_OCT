/*
Aca viven todas las templates HTML de los mails que manda la plataforma.
Cada template es una funcion que recibe los datos dinamicos (links, nombres, etc)
y devuelve el HTML listo para enviar.

Importante: los mails usan tablas y estilos INLINE porque la mayoria de los clientes
de correo (Gmail, Outlook) eliminan las etiquetas <style> y el CSS de <head>.
*/

/*
Email de verificacion de correo electronico.
El link siempre apunta al FRONTEND (/verify-email) pasando el token por querystring.
*/
export function verificationEmailTemplate(verification_email_url) {
    return `
        <!DOCTYPE html>
        <html>
            <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 32px 16px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px;">

                                <!-- Logo -->
                                <tr>
                                    <td align="center" style="padding-bottom: 24px;">
                                        <img
                                            alt="Slack"
                                            height="36"
                                            src="https://a.slack-edge.com/bv1-13/slack_logo-97f7334.svg"
                                        />
                                    </td>
                                </tr>

                                <!-- Tarjeta principal -->
                                <tr>
                                    <td style="background-color: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                                        <h1 style="margin: 0 0 12px 0; font-size: 22px; color: #1d1c1d; text-align: center;">
                                            Bienvenido a nuestra plataforma
                                        </h1>
                                        <p style="margin: 0 0 24px 0; font-size: 15px; color: #454245; line-height: 1.6; text-align: center;">
                                            Necesitamos verificar este correo electronico para activar tu cuenta.
                                            Hacé click en el botón de abajo para confirmar que sos vos.
                                        </p>

                                        <!-- Boton -->
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center">
                                                    <a
                                                        href='${verification_email_url}'
                                                        style="display: inline-block; background-color: #4a154b; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 40px; border-radius: 8px;"
                                                    >
                                                        Verificar mi cuenta
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Link alternativo -->
                                        <p style="margin: 28px 0 0 0; font-size: 13px; color: #696969; line-height: 1.6; text-align: center;">
                                            Si el botón no funciona, copiá y pegá este link en tu navegador:
                                            <br />
                                            <a
                                                href='${verification_email_url}'
                                                style="color: #1264a3; word-break: break-all;"
                                            >
                                                ${verification_email_url}
                                            </a>
                                        </p>
                                    </td>
                                </tr>

                                <!-- Aviso de expiracion -->
                                <tr>
                                    <td style="padding-top: 16px;">
                                        <p style="margin: 0; font-size: 12px; color: #9a9a9a; line-height: 1.6; text-align: center;">
                                            Este link de verificacion vence en 7 dias. Si vos no creaste esta cuenta,
                                            podés ignorar este mensaje y no se hara ningún cambio.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `
}
