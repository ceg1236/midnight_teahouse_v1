type EnvMode = 'live' | 'test'

function getMode(): EnvMode {
  return process.env.PAYMENT_ENV === 'test' ? 'test' : 'live'
}

function getScoped(name: string): string | undefined {
  const mode = getMode()
  if (mode === 'test') {
    const testValue = process.env[`TEST_${name}`]
    if (testValue) return testValue
  }
  return process.env[name]
}

export function getStripeSecretKey(): string | undefined {
  return getScoped('STRIPE_SECRET_KEY')
}

export function getStripeWebhookSecret(): string | undefined {
  return getScoped('STRIPE_WEBHOOK_SECRET')
}

export function getSheetsConfig() {
  return {
    spreadsheetId: getScoped('SPREADSHEET_ID'),
    sheetName: getScoped('SPREADSHEET_SHEET_NAME') || 'Sheet1',
    credentialsJson: getScoped('GOOGLE_CREDENTIALS_JSON'),
    credentialsPath: getScoped('GOOGLE_APPLICATION_CREDENTIALS'),
  }
}

export function getPaymentModeLabel(): EnvMode {
  return getMode()
}
