import { Resend } from 'resend'
import { eventDates, eventTiers } from '../content/event-invite.config'

type SendConfirmationParams = {
  to: string
  name: string
  ticketDate: string
  amountPaid: string
  quantity: string
  orderSummary: string
}

function buildOrderSummary(metadata: Record<string, string | undefined>): string {
  const order = metadata.order
  if (!order || typeof order !== 'string') {
    return metadata.quantity ? `${metadata.quantity} ticket(s)` : '1 ticket'
  }
  const parts: string[] = []
  for (const pair of order.split(',')) {
    const [tierId, qStr] = pair.split(':')
    const q = parseInt(qStr ?? '1', 10)
    if (!tierId || isNaN(q) || q < 1) continue
    const tier = eventTiers.find((t) => t.id === tierId)
    const label = tier?.label ?? tierId
    const price =
      tierId === 'supported' && metadata.supportedPrice
        ? `$${metadata.supportedPrice}`
        : tier
          ? `$${tier.price}`
          : ''
    parts.push(`${q} × ${label} ${price}`.trim())
  }
  return parts.length > 0 ? parts.join(', ') : String(order)
}

function buildHtml(params: SendConfirmationParams): string {
  const { name, ticketDate, amountPaid, quantity, orderSummary } = params
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="font-size: 1.5rem; color: #2E0303; margin-bottom: 16px;">You're in!</h1>
  <p>Hi ${name},</p>
  <p>Thank you for reserving your spot at Midnight Teahouse. We're so looking forward to seeing you.</p>
  <div style="background: #f8f6f2; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0 0 8px 0;"><strong>${ticketDate}</strong></p>
    <p style="margin: 0 0 8px 0;">${orderSummary}</p>
    <p style="margin: 0 0 8px 0;">Total: ${amountPaid} (${quantity} ticket${parseInt(quantity, 10) > 1 ? 's' : ''})</p>
  </div>
  <p>Doors open at 7pm and close at 11pm. Feel free to join us anytime in this window. We'll share the location once we're closer to the date.</p>
  <p style="margin-top: 24px;">See you in the teahouse,<br>The Midnight Teahouse Team</p>
</body>
</html>
`.trim()
}

export async function sendConfirmationEmail(
  metadata: Record<string, string | undefined>,
  amountPaid: string,
  quantity: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY not set')
    return { ok: false, error: 'Resend not configured' }
  }

  const to = metadata.email
  const name = metadata.name ?? 'there'
  if (!to) return { ok: false, error: 'No recipient email' }

  const date = eventDates.find((d) => d.id === metadata.dateId)
  const ticketDate = (date?.label ?? metadata.dateId ?? '').replace(/\n/g, ' ')
  const orderSummary = buildOrderSummary(metadata)

  const from = process.env.RESEND_FROM ?? 'Midnight Teahouse <onboarding@resend.dev>'
  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: 'Your Midnight Teahouse reservation is confirmed',
    html: buildHtml({
      to,
      name,
      ticketDate,
      amountPaid,
      quantity,
      orderSummary,
    }),
  })

  if (error) {
    console.error(
      JSON.stringify({
        event: 'confirmation_email_failed',
        error: error.message,
        to,
      })
    )
    return { ok: false, error: error.message }
  }

  console.log(
    JSON.stringify({
      event: 'confirmation_email_sent',
      emailId: data?.id,
      to,
    })
  )
  return { ok: true }
}
