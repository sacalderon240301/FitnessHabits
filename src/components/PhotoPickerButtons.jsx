import { Camera, Image as ImageIcon } from 'lucide-react'

/**
 * Dos botones separados en vez de un único input de archivo — así el
 * celular siempre ofrece tomar la foto en el momento, sin depender de
 * si el navegador decide mostrar la cámara en el selector genérico.
 */
export default function PhotoPickerButtons({ onPick, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, ...style }}>
      <label style={styles.btn}>
        <Camera size={15} />
        Tomar foto
        <input type="file" accept="image/*" capture="environment" onChange={onPick} style={{ display: 'none' }} />
      </label>
      <label style={styles.btn}>
        <ImageIcon size={15} />
        Galería
        <input type="file" accept="image/*" onChange={onPick} style={{ display: 'none' }} />
      </label>
    </div>
  )
}

const styles = {
  btn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '11px', borderRadius: 10, border: '1px dashed var(--border)',
    background: 'transparent', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer',
  },
}
