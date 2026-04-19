import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Envia e-mail de recuperação de senha / ativação de conta
 */
export async function sendPasswordResetEmail(email: string, token: string, name?: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  // No desenvolvimento, redireciona tudo para o e-mail do desenvolvedor para evitar erros do Resend
  const isDev = process.env.NODE_ENV === 'development'
  const recipient = isDev ? 'marcostsilva.ia@gmail.com' : email
  
  const { data, error } = await resend.emails.send({
    from: 'HyperShape <onboarding@resend.dev>', 
    to: recipient,
    subject: isDev ? `[TESTE - PARA: ${email}] Defina sua senha - HyperShape` : 'Defina sua senha - HyperShape',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border-radius: 16px;">
        <h1 style="color: #CBFB45; font-size: 24px;">Olá, ${name || 'Atleta'}!</h1>
        <p style="color: #a1a1aa; line-height: 1.6;">
          Você foi convidado para o <strong>HyperShape</strong>. Para começar a acompanhar seus treinos e evolução, você precisa definir sua senha de acesso.
        </p>
        <div style="margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #CBFB45; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
            Definir Minha Senha
          </a>
        </div>
        <p style="color: #71717a; font-size: 12px; border-top: 1px solid #27272a; padding-top: 20px;">
          Se você não esperava este e-mail, pode ignorá-lo com segurança. O link expira em 7 dias.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error('Erro ao enviar e-mail via Resend:', error)
    return { error }
  }

  return { data }
}
