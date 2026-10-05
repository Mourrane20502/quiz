// Public-facing texts editable from the admin "Gestion B2C" page. Keep in sync with client/src/data/content.js.
export const CONTENT_FIELDS = {
  eventName: { default: 'Marrakech Airshow 2026', max: 100 },
  eventDay: { default: 'Journée « Talents »', max: 100 },
  eventDate: { default: '9 octobre 2026', max: 60 },
  eventCity: { default: 'Marrakech', max: 60 },
  eventLocation: { default: 'Marrakech, Maroc', max: 100 },
  organizer: { default: 'ASSAD', max: 100 },
  partner: { default: 'Ministère de l’Industrie et du Commerce', max: 150 },

  homeTitle: { default: 'Prenez votre envol,', max: 80 },
  homeTitleHighlight: { default: 'testez vos connaissances.', max: 80 },
  homeDescription: {
    default:
      'Le quiz officiel de la Journée « Talents » du Marrakech Airshow 2026. Aéronautique, industrie et culture du salon : relevez le défi depuis votre téléphone.',
    max: 400,
  },
  step1Title: { default: 'Scannez', max: 40 },
  step1Text: { default: 'Pointez l’appareil photo de votre téléphone vers le QR code.', max: 160 },
  step2Title: { default: 'Inscrivez-vous', max: 40 },
  step2Text: { default: 'Nom, école, téléphone et, si vous le souhaitez, une photo.', max: 160 },
  step3Title: { default: 'Décollez', max: 40 },
  step3Text: { default: 'Répondez vite et juste : chaque question est chronométrée.', max: 160 },

  quizTitle: { default: 'Quiz', max: 40 },
  quizDescription: {
    default:
      'Le salon international de l’aéronautique, du spatial et de la défense ouvre ses portes aux jeunes talents. Testez vos connaissances sur l’événement et le monde de l’aviation !',
    max: 500,
  },
  quizClosedTitle: { default: 'Le quiz n’est pas encore ouvert', max: 100 },
  quizClosedText: {
    default: 'Restez sur cette page : elle se mettra à jour automatiquement dès l’ouverture.',
    max: 250,
  },

  logoMinistryTitle: { default: 'Royaume du Maroc – Ministère de l’Industrie et du Commerce', max: 150 },
  logoAirshowTitle: { default: 'Marrakech Airshow 2026', max: 150 },
  logoAssadTitle: {
    default: 'ASSAD – Association des Salons du Spatial, de l’Aéronautique et de la Défense',
    max: 150,
  },

  thankYouText: {
    default:
      'Vos réponses ont bien été enregistrées. Les résultats et le classement seront annoncés par les organisateurs.',
    max: 400,
  },
}

export const LOGO_SLOTS = ['ministry', 'airshow', 'assad']
export const logoKey = (slot) => `logo_${slot}`

export const CONTENT_DEFAULTS = Object.fromEntries(
  Object.entries(CONTENT_FIELDS).map(([key, field]) => [key, field.default]),
)
