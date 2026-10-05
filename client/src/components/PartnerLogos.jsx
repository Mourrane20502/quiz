import { Fragment } from 'react'
import { useContent } from '../content/ContentContext.js'
import { LOGOS } from '../data/logos.js'

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
  const content = useContent()
  const { logos } = content

  return (
    <div className={`flex items-center justify-center ${s.gap} ${className}`}>
      {LOGOS.map((logo, i) => {
        const custom = logos?.[logo.slot]
        const shrink = custom || logo.slot === 'ministry' ? 'min-w-0 shrink' : 'shrink-0'
        return (
          <Fragment key={logo.slot}>
            {i > 0 && <Divider className={s.divider} />}
            <img
              src={custom || logo.src}
              alt={content[logo.titleKey]}
              title={content[logo.titleKey]}
              className={`${s[logo.slot]} w-auto ${shrink} object-contain`}
            />
          </Fragment>
        )
      })}
    </div>
  )
}

export default PartnerLogos
