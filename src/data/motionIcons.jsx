// Iconografía minimalista de la app: formas abstractas (barras, cápsulas,
// flechas), sin personaje. Reemplaza a la mascota-gorila original.
// Todo se dibuja con trazo, sobre un lienzo 0 0 100 100, para que se vea
// consistente sin importar dónde se use (48px, 72px, etc).

function Wrap({ children, viewBox = '0 0 100 100' }) {
  return (
    <svg viewBox={viewBox} width="100%" height="100%" fill="none">
      {children}
    </svg>
  )
}

const structure = 'var(--ink-muted)'
const accent = 'var(--thread-gold)'

function Bar({ x1 = 14, x2 = 86, y = 20 }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={structure} strokeWidth="4" strokeLinecap="round" />
}

function Capsule({ x, y, w = 16, h = 32, rotate = 0 }) {
  return (
    <rect
      x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
      stroke={accent} strokeWidth="4"
    />
  )
}

function Chevron({ x, y, up = true }) {
  const dy = up ? -6 : 6
  return (
    <path
      d={`M ${x - 7} ${y - dy} L ${x} ${y + dy} L ${x + 7} ${y - dy}`}
      stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    />
  )
}

export const PullUpPose = () => (
  <Wrap>
    <Bar />
    <line x1="42" y1="20" x2="42" y2="30" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="20" x2="58" y2="30" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <Capsule x={50} y={58} />
    <Chevron x={50} y={40} up />
  </Wrap>
)

export const DeadHangPose = () => (
  <Wrap>
    <Bar />
    <line x1="42" y1="20" x2="42" y2="32" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="20" x2="58" y2="32" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <Capsule x={50} y={68} h={36} />
    <line x1="30" y1="52" x2="70" y2="52" stroke={structure} strokeWidth="1.5" strokeDasharray="2 5" />
  </Wrap>
)

export const HangingAbsPose = () => (
  <Wrap>
    <Bar />
    <line x1="42" y1="20" x2="42" y2="30" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="20" x2="58" y2="30" stroke={structure} strokeWidth="3" strokeLinecap="round" />
    <Capsule x={50} y={52} h={26} />
    <Capsule x={50} y={78} w={13} h={22} rotate={35} />
    <Chevron x={72} y={66} up />
  </Wrap>
)

export const DipsPose = () => (
  <Wrap>
    <line x1="26" y1="16" x2="26" y2="46" stroke={structure} strokeWidth="4" strokeLinecap="round" />
    <line x1="74" y1="16" x2="74" y2="46" stroke={structure} strokeWidth="4" strokeLinecap="round" />
    <Capsule x={50} y={54} rotate={90} w={14} h={40} />
    <Chevron x={50} y={78} up={false} />
  </Wrap>
)

export const DeclinePushupPose = () => (
  <Wrap>
    <line x1="14" y1="70" x2="34" y2="70" stroke={structure} strokeWidth="4" strokeLinecap="round" />
    <line x1="24" y1="70" x2="24" y2="60" stroke={structure} strokeWidth="4" strokeLinecap="round" />
    <Capsule x={54} y={58} w={13} h={46} rotate={70} />
    <line x1="14" y1="82" x2="86" y2="82" stroke={structure} strokeWidth="1.5" strokeDasharray="2 5" />
    <Chevron x={80} y={40} up />
  </Wrap>
)

export const motionIcons = {
  pullup: PullUpPose,
  deadhang: DeadHangPose,
  hangingabs: HangingAbsPose,
  dips: DipsPose,
  declinepushup: DeclinePushupPose,
}

// Marca de la app: tres nodos unidos por hilos, la misma idea visual que
// DayWeave (el "tejido" de días) pero como ícono compacto. Sin mascota.
export const WeaveMark = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" fill="none">
    <line x1="20" y1="66" x2="50" y2="34" stroke="var(--thread-dim)" strokeWidth="3" />
    <line x1="50" y1="34" x2="80" y2="66" stroke="var(--thread-dim)" strokeWidth="3" />
    <line x1="20" y1="66" x2="80" y2="66" stroke="var(--thread-dim)" strokeWidth="3" strokeDasharray="2 6" />
    <circle cx="20" cy="66" r="8" fill="var(--surface)" stroke="var(--focus-teal)" strokeWidth="4" />
    <circle cx="80" cy="66" r="8" fill="var(--surface)" stroke="var(--slip-rust)" strokeWidth="4" />
    <circle cx="50" cy="34" r="10" fill="var(--thread-gold)" />
  </svg>
)
