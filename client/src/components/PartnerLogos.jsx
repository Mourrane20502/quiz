import ministryLogo from '../assets/logos/ministere-industrie.png'
import airshowLogo from '../assets/logos/marrakech-airshow.png'
import assadLogo from '../assets/logos/assad.png'

const SIZES = {
  sm: { ministry: 'h-6', airshow: 'h-8', assad: 'h-9', gap: 'gap-2.5', divider: 'h-6' },
  md: { ministry: 'h-8 sm:h-10', airshow: 'h-11 sm:h-14', assad: 'h-12 sm:h-14', gap: 'gap-3 sm:gap-5', divider: 'h-8 sm:h-10' },
  lg: { ministry: 'h-9 sm:h-12', airshow: 'h-12 sm:h-16', assad: 'h-13 sm:h-17', gap: 'gap-3 sm:gap-6', divider: 'h-9 sm:h-12' },
}

function Divider({ className }) {
  return <span className={`w-px shrink-0 bg-navy/15 ${className}`} aria-hidden="true" />
}

function PartnerLogos({ size = 'md', className = '' }) {
  const s = SIZES[size]

  return (
    <div className={`flex items-center justify-center ${s.gap} ${className}`}>
      <img
        src={ministryLogo}
        alt="Royaume du Maroc – Ministère de l’Industrie et du Commerce"
        className={`${s.ministry} w-auto min-w-0 shrink object-contain`}
      />
      <Divider className={s.divider} />
      <img src={airshowLogo} alt="Marrakech Airshow 2026" className={`${s.airshow} w-auto shrink-0 object-contain`} />
      <Divider className={s.divider} />
      <img
        src={assadLogo}
        alt="ASSAD – Association des Salons du Spatial, de l’Aéronautique et de la Défense"
        className={`${s.assad} w-auto shrink-0 object-contain`}
      />
    </div>
  )
}

export default PartnerLogos
