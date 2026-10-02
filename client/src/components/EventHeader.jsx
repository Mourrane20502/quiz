import PartnerLogos from './PartnerLogos.jsx'

function EventHeader({ compact = false }) {
  if (compact) {
    return (
      <header className="flex justify-center py-2">
        <div className="rounded-full bg-white/90 px-4 py-1.5 shadow-sm ring-1 ring-navy/10 backdrop-blur">
          <PartnerLogos size="sm" />
        </div>
      </header>
    )
  }

  return (
    <header className="rounded-2xl bg-white/90 px-3 py-3 shadow-md ring-1 ring-navy/10 backdrop-blur">
      <PartnerLogos size="md" />
    </header>
  )
}

export default EventHeader
