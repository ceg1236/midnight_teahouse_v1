import { Resend } from 'resend'
import { getEventConfig } from './event-registry'
import {
  getAddressMapUrl,
  getConfirmationEmailIntro,
  getEventPracticalNotes,
} from './event-messaging'
import { getTiersForEvent } from './event-tiers'
import { getTicketFormatLabels } from './ticket-format-labels'

export type SendConfirmationParams = {
  to: string
  eventSlug: string
  name: string
  ticketDate: string
  amountPaid: string
  quantity: string
  orderSummary: string
  ticketFormat?: string
}

function buildOrderSummary(metadata: Record<string, string | undefined>): string {
  const event = getEventConfig(metadata.eventSlug)
  const eventTiers = getTiersForEvent(event, metadata.ticketFormat)
  const formatLabels = getTicketFormatLabels(event.ticketFormats)
  const formatLabel = metadata.ticketFormat ? formatLabels[metadata.ticketFormat] : undefined

  const order = metadata.order
  let tierSummary: string
  if (!order || typeof order !== 'string') {
    tierSummary = metadata.quantity ? `${metadata.quantity} ticket(s)` : '1 ticket'
  } else {
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
    tierSummary = parts.length > 0 ? parts.join(', ') : String(order)
  }

  return formatLabel ? `${formatLabel} · ${tierSummary}` : tierSummary
}

function buildHtml(params: SendConfirmationParams): string {
  const { eventSlug, name, ticketDate, amountPaid, quantity, orderSummary, ticketFormat } = params
  const event = getEventConfig(eventSlug)
  const notes = getEventPracticalNotes(event.slug, ticketFormat)
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
  <p>Thank you for reserving a seat at ${event.title}! ${getConfirmationEmailIntro(event.slug, ticketFormat)}</p>
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

export type PreviewEmailOptions = Partial<SendConfirmationParams> & {
  dateId?: string
}

export function getConfirmationEmailSubject(eventSlug: string): string {
  const event = getEventConfig(eventSlug)
  return `Confirmation: Your ${event.title} reservation`
}

/** Sample params for preview/test; defaults to midsummer-event and first date. */
export function resolvePreviewParams(options: PreviewEmailOptions = {}): SendConfirmationParams {
  const eventSlug = options.eventSlug ?? 'midsummer-event'
  const event = getEventConfig(eventSlug)
  const date = options.dateId
    ? event.dates.find((d) => d.id === options.dateId)
    : event.dates[0]
  const ticketFormat = options.ticketFormat
  const tiers = getTiersForEvent(event, ticketFormat)
  const sampleTier = tiers.find((t) => t.id === 'community') ?? tiers[0]
  const defaultOrderSummary = sampleTier
    ? `1 × ${sampleTier.label} $${sampleTier.price}`
    : '1 ticket'
  const defaultAmount = sampleTier ? `$${sampleTier.price}` : '$40'

  return {
    to: options.to ?? 'test@example.com',
    eventSlug: event.slug,
    name: options.name ?? 'Alex',
    ticketDate: (options.ticketDate ?? date?.label ?? event.dateRangeLabel).replace(/\n/g, ' '),
    amountPaid: options.amountPaid ?? defaultAmount,
    quantity: options.quantity ?? '1',
    orderSummary: options.orderSummary ?? defaultOrderSummary,
    ticketFormat,
  }
}

/** Build HTML for preview or test. Use with GET /api/email-preview or POST /api/email-test. */
export function getPreviewHtml(options?: PreviewEmailOptions): string {
  return buildHtml(resolvePreviewParams(options))
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
    subject: getConfirmationEmailSubject(event.slug),
    html: buildHtml({
      to,
      eventSlug: event.slug,
      name,
      ticketDate,
      amountPaid,
      quantity,
      orderSummary,
      ticketFormat: metadata.ticketFormat,
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
