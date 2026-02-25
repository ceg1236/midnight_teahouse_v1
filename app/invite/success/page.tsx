import Link from 'next/link'

export default function InviteSuccessPage() {
  return (
    <div className="invite-success flex min-h-[100dvh] flex-col items-center justify-center px-6 md:min-h-screen">
      <div className="invite-welcome mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <h1 className="font-invite text-3xl text-inherit md:text-4xl">
          You&apos;re in!
        </h1>
        <p className="font-invite text-lg leading-relaxed opacity-90">
          Thank you for reserving your spot. We&apos;ll send a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="invite-reserve rounded-lg bg-[#f8f6f2] px-10 py-4 font-invite text-xl text-[#162143] hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
