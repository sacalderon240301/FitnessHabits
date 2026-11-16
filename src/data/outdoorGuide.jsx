// Guía estática de técnica y calentamiento para trote/parque.
// Las ilustraciones son diagramas de líneas simples, dibujados para esta
// app (no son fotos ni capturas de ningún lado) — mantienen el mismo
// estilo visual del resto de la app: fondo oscuro, trazos dorado/teal.

const stroke = 'var(--thread-gold)'
const strokeDim = 'var(--ink-muted)'

function Figure({ children }) {
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" fill="none">
      {children}
    </svg>
  )
}

const PosturaTrote = () => (
  <Figure>
    {/* cabeza */}
    <circle cx="60" cy="22" r="8" stroke={stroke} strokeWidth="3" />
    {/* torso, ligera inclinación adelante */}
    <line x1="60" y1="30" x2="66" y2="66" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* brazo atrás doblado ~90° */}
    <line x1="63" y1="40" x2="48" y2="46" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="48" y1="46" x2="52" y2="60" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* brazo adelante doblado */}
    <line x1="64" y1="40" x2="80" y2="34" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="80" y1="34" x2="78" y2="20" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* pierna atrás extendida */}
    <line x1="66" y1="66" x2="50" y2="90" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="50" y1="90" x2="42" y2="100" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* pierna adelante flexionada */}
    <line x1="66" y1="66" x2="82" y2="82" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="82" y1="82" x2="76" y2="100" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* línea de piso */}
    <line x1="20" y1="105" x2="100" y2="105" stroke={strokeDim} strokeWidth="1.5" strokeDasharray="2 4" />
  </Figure>
)

const Cadencia = () => (
  <Figure>
    <circle cx="55" cy="20" r="8" stroke={stroke} strokeWidth="3" />
    <line x1="55" y1="28" x2="60" y2="62" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="38" x2="42" y2="34" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="38" x2="74" y2="46" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* pierna que aterriza justo bajo la cadera */}
    <line x1="60" y1="62" x2="60" y2="88" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="88" x2="66" y2="98" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* punto de contacto medio pie */}
    <circle cx="66" cy="98" r="4" fill={stroke} />
    {/* pierna trasera elevándose */}
    <line x1="60" y1="62" x2="42" y2="70" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="42" y1="70" x2="34" y2="58" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="105" x2="100" y2="105" stroke={strokeDim} strokeWidth="1.5" strokeDasharray="2 4" />
  </Figure>
)

const Respiracion = () => (
  <Figure>
    <circle cx="60" cy="55" r="26" stroke={strokeDim} strokeWidth="2" />
    <circle cx="60" cy="55" r="16" stroke={stroke} strokeWidth="3" />
    {/* flechas de expansión */}
    <line x1="60" y1="20" x2="60" y2="10" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M55 15 L60 8 L65 15" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="60" y1="90" x2="60" y2="100" stroke={strokeDim} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M55 95 L60 102 L65 95" stroke={strokeDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Figure>
)

const EstiramientoPantorrilla = () => (
  <Figure>
    {/* pared */}
    <line x1="95" y1="15" x2="95" y2="105" stroke={strokeDim} strokeWidth="2" />
    <circle cx="72" cy="24" r="7" stroke={stroke} strokeWidth="3" />
    <line x1="74" y1="31" x2="84" y2="55" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="78" y1="35" x2="92" y2="30" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* pierna adelante flexionada */}
    <line x1="84" y1="55" x2="78" y2="80" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="78" y1="80" x2="86" y2="100" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* pierna atrás extendida y talón abajo */}
    <line x1="84" y1="55" x2="55" y2="72" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="55" y1="72" x2="40" y2="100" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="105" x2="100" y2="105" stroke={strokeDim} strokeWidth="1.5" strokeDasharray="2 4" />
  </Figure>
)

const MovilidadCadera = () => (
  <Figure>
    <circle cx="60" cy="20" r="8" stroke={stroke} strokeWidth="3" />
    <line x1="60" y1="28" x2="60" y2="60" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="36" x2="42" y2="44" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="36" x2="78" y2="44" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="90" x2="52" y2="60" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="90" x2="56" y2="102" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* pierna que rota, arco de movimiento */}
    <path d="M62 60 Q88 66 82 90" stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M78 62 A22 22 0 0 1 90 82" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 4" fill="none" />
    <line x1="20" y1="105" x2="100" y2="105" stroke={strokeDim} strokeWidth="1.5" strokeDasharray="2 4" />
  </Figure>
)

const ZancadasDinamicas = () => (
  <Figure>
    <circle cx="55" cy="18" r="8" stroke={stroke} strokeWidth="3" />
    <line x1="56" y1="26" x2="62" y2="58" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="58" y1="36" x2="40" y2="30" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    <line x1="61" y1="36" x2="78" y2="40" stroke={strokeDim} strokeWidth="3" strokeLinecap="round" />
    {/* pierna adelante en zancada profunda */}
    <line x1="62" y1="58" x2="80" y2="72" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="80" y1="72" x2="76" y2="98" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* pierna atrás, rodilla casi al piso */}
    <line x1="62" y1="58" x2="44" y2="76" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <line x1="44" y1="76" x2="52" y2="98" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    {/* flecha de avance */}
    <path d="M86 45 L98 45 M92 40 L98 45 L92 50" stroke={strokeDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="20" y1="105" x2="100" y2="105" stroke={strokeDim} strokeWidth="1.5" strokeDasharray="2 4" />
  </Figure>
)

export const outdoorGuide = [
  {
    id: 'postura',
    category: 'técnica',
    title: 'Postura al trotar',
    tip: 'Mira al frente, no al piso. Tronco recto con una inclinación leve hacia adelante desde el tobillo, no desde la cintura. Hombros relajados, lejos de las orejas.',
    Illustration: PosturaTrote,
  },
  {
    id: 'cadencia',
    category: 'técnica',
    title: 'Cadencia y aterrizaje',
    tip: 'Busca pasos cortos y rápidos (apunta a ritmo alto de pasos por minuto) y que el pie caiga justo debajo de tu cadera, no muy adelante del cuerpo. Eso reduce el frenado en cada zancada.',
    Illustration: Cadencia,
  },
  {
    id: 'respiracion',
    category: 'técnica',
    title: 'Respiración',
    tip: 'Respira con el abdomen, no solo el pecho. Prueba un patrón parejo, por ejemplo inhalar 3 pasos y exhalar 2 — si no te alcanza para hablar en frases cortas, vas muy rápido para trote suave.',
    Illustration: Respiracion,
  },
  {
    id: 'pantorrilla',
    category: 'estiramiento',
    title: 'Estiramiento de pantorrilla',
    tip: 'Apoya las manos en una pared, un pie atrás con el talón pegado al piso y la pierna recta. Mantén 20-30 segundos por lado. Ideal después de trotar, no antes en frío.',
    Illustration: EstiramientoPantorrilla,
  },
  {
    id: 'cadera',
    category: 'estiramiento',
    title: 'Movilidad de cadera',
    tip: 'De pie, lleva la rodilla hacia el pecho y luego ábrela hacia afuera en un círculo amplio. 8-10 repeticiones por lado, antes de salir a trotar.',
    Illustration: MovilidadCadera,
  },
  {
    id: 'zancadas',
    category: 'estiramiento',
    title: 'Zancadas dinámicas',
    tip: 'Un paso largo hacia adelante, baja la rodilla trasera casi al piso, y avanza. 8-10 pasos como parte del calentamiento, no como estiramiento estático.',
    Illustration: ZancadasDinamicas,
  },
]
