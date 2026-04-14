import { Resend } from 'resend'
import { getEventConfig } from './event-registry'
import { getAddressMapUrl, getEventPracticalNotes } from './event-messaging'

export type SendConfirmationParams = {
  to: string
  eventSlug: string
  name: string
  ticketDate: string
  amountPaid: string
  quantity: string
  orderSummary: string
}

function buildOrderSummary(metadata: Record<string, string | undefined>): string {
  const event = getEventConfig(metadata.eventSlug)
  const order = metadata.order
  if (!order || typeof order !== 'string') {
    return metadata.quantity ? `${metadata.quantity} ticket(s)` : '1 ticket'
  }
  const parts: string[] = []
  for (const pair of order.split(',')) {
    const [tierId, qStr] = pair.split(':')
    const q = parseInt(qStr ?? '1', 10)
    if (!tierId || isNaN(q) || q < 1) continue
    const tier = event.tiers.find((t) => t.id === tierId)
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
  const { eventSlug, name, ticketDate, amountPaid, quantity, orderSummary } = params
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug)
  const mapUrl = getAddressMapUrl(event.address)
  const notesHtml = notes
    .map((n) => {
      if (n.label === 'Where') {
        return `<li><strong>${n.label}:</strong> <a href="${mapUrl}" style="color: #2E0303; text-decoration: underline;">${n.text}</a>.</li>`
      }
      return `<li><strong>${n.label}:</strong> ${n.text}</li>`
    })
    .join('\n    ')
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <p>Hi ${name},</p>
  <p>Thank you for reserving a seat at ${event.title}! We're very excited to share this evening with you - to slow down together, enjoy tea and music, settle into the night.</p>
  <div style="background: #f8f6f2; padding: 16px; border-radius: 8px; margin: 24px 0;">
    <p style="margin: 0 0 8px 0;"><strong>${ticketDate}</strong></p>
    <p style="margin: 0 0 8px 0;">${orderSummary}</p>
    <p style="margin: 0 0 8px 0;">Total: ${amountPaid} (${quantity} ticket${parseInt(quantity, 10) > 1 ? 's' : ''})</p>
  </div>
  <p>A few practical notes for your visit:</p>
  <ul style="margin: 16px 0; padding-left: 20px;">
    ${notesHtml}
  </ul>
  <p>Thanks again for joining us in this experiment. See you soon.</p>
  <p style="margin-top: 24px;">The Midnight Teahouse Team</p>
</body>
</html>
`.trim()
}

/** Build HTML for preview or test. Use with GET /api/email-preview or POST /api/email-test. */
export function getPreviewHtml(overrides?: Partial<SendConfirmationParams>): string {
  const params: SendConfirmationParams = {
    to: 'test@example.com',
    eventSlug: 'crossing-into-spring',
    name: 'Alex',
    ticketDate: 'Wednesday, March 18',
    amountPaid: '$40',
    quantity: '1',
    orderSummary: '1 × Community $40',
    ...overrides,
  }
  return buildHtml(params)
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

  const event = getEventConfig(metadata.eventSlug)
  const date = event.dates.find((d) => d.id === metadata.dateId)
  const ticketDate = (date?.label ?? metadata.dateId ?? '').replace(/\n/g, ' ')
  const orderSummary = buildOrderSummary(metadata)

  const from = process.env.RESEND_FROM ?? 'Midnight Teahouse <onboarding@resend.dev>'
  const replyTo = process.env.RESEND_REPLY_TO // e.g. midnight.teahouse.sf@gmail.com
  const resend = new Resend(apiKey)

  console.log(
    JSON.stringify({
      event: 'confirmation_email_attempt',
      to,
      from,
    })
  )

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    ...(replyTo && { replyTo }),
    subject: `Confirmation: Your ${event.title} reservation`,
    html: buildHtml({
      to,
      eventSlug: event.slug,
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
