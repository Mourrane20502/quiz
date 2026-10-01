import ministryLogo from '../assets/event/ministry-logo.png'
import airshowLogo from '../assets/event/airshow-logo.png'
import assadLogo from '../assets/event/assad-logo.png'

function EventHeader({ compact = false }) {
  if (compact) {
    return (
      <header className="flex items-center justify-center py-3">
        <img src={airshowLogo} alt="Marrakech Airshow 2026" className="h-12 w-auto" />
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between gap-3">
      <img
        src={ministryLogo}
        alt="Royaume du Maroc - Ministère de l'Industrie et du Commerce"
        className="h-10 w-auto sm:h-14"
      />
      <img src={assadLogo} alt="ASSAD" className="h-12 w-auto sm:h-16" />
    </header>
  )
}

export default EventHeader
