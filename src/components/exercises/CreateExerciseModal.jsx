import { useState } from 'react'
import { X } from 'lucide-react'
import { muscleGroups, exerciseLocations } from '../../data/exerciseCatalog'
import { uploadPhoto } from '../../lib/uploadPhoto'
import PhotoPickerButtons from '../PhotoPickerButtons'

export default function CreateExerciseModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [muscleGroup, setMuscleGroup] = useState(muscleGroups[0].id)
  const [tracking, setTracking] = useState('reps')
  const [trackWeight, setTrackWeight] = useState(false)
  const [defaultLocation, setDefaultLocation] = useState('casa')
  const [tip, setTip] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleSubmit = async () => {
    if (!name.trim() || uploading) return
    setUploading(true)
    const photo_url = photoFile ? await uploadPhoto('exercise-photos', photoFile) : null
    setUploading(false)
    onSubmit({
      name: name.trim(),
      muscle_group: muscleGroup,
      tracking_type: tracking,
      track_weight: trackWeight,
      default_location: defaultLocation,
      tip: tip.trim() || null,
      photo_url,
    })
    onClose()
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.handle} />
        <h2 style={styles.title}>Nuevo ejercicio</h2>

        <label style={styles.label}>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Curl martillo" style={styles.input} />

        <label style={styles.label}>Grupo muscular</label>
        <div style={styles.chipGrid}>
          {muscleGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setMuscleGroup(g.id)}
              style={{ ...styles.chip, ...(muscleGroup === g.id ? styles.chipActive : {}) }}
            >
              {g.label}
            </button>
          ))}
        </div>

        <label style={styles.label}>¿Cómo lo registras?</label>
        <div style={styles.toggle}>
          <button
            onClick={() => setTracking('reps')}
            style={{ ...styles.toggleBtn, ...(tracking === 'reps' ? styles.toggleBtnActive : {}) }}
          >
            Repeticiones por serie
          </button>
          <button
            onClick={() => setTracking('time')}
            style={{ ...styles.toggleBtn, ...(tracking === 'time' ? styles.toggleBtnActive : {}) }}
          >
            Tiempo (ej: plancha)
          </button>
        </div>

        <label style={styles.checkboxRow}>
          <input type="checkbox" checked={trackWeight} onChange={(e) => setTrackWeight(e.target.checked)} />
          También anotar peso por serie
        </label>

        <label style={styles.label}>Dónde lo haces normalmente</label>
        <div style={styles.toggle}>
          {exerciseLocations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setDefaultLocation(loc.id)}
              style={{ ...styles.toggleBtn, ...(defaultLocation === loc.id ? styles.toggleBtnActive : {}) }}
            >
              {loc.label}
            </button>
          ))}
        </div>

        <label style={styles.label}>Nota de técnica (opcional)</label>
        <textarea value={tip} onChange={(e) => setTip(e.target.value)} style={styles.textarea} rows={2} placeholder="Tips para hacerlo bien" />

        <label style={styles.label}>Foto de la máquina (opcional)</label>
        {photoPreview ? (
          <div style={styles.photoPreviewWrap}>
            <img src={photoPreview} alt="" style={styles.photoPreview} />
            <button onClick={removePhoto} style={styles.photoRemoveBtn} aria-label="Quitar foto">
              <X size={14} />
            </button>
          </div>
        ) : (
          <PhotoPickerButtons onPick={handlePhotoChange} />
        )}

        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>Cancelar</button>
          <button onClick={handleSubmit} style={styles.saveBtn} disabled={uploading}>
            {uploading ? 'Subiendo...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 },
  sheet: { width: '100%', maxWidth: 480, background: 'var(--surface-raised)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '10px 20px 24px', boxShadow: '0 -8px 30px rgba(0,0,0,0.4)', maxHeight: '85vh', overflowY: 'auto' },
  handle: { width: 36, height: 4, borderRadius: 2, background: 'var(--thread-dim)', margin: '4px auto 16px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 19, margin: '0 0 14px', fontWeight: 500, color: 'var(--ink)' },
  label: { fontSize: 11, color: 'var(--ink-muted)', display: 'block', margin: '10px 0 4px' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14 },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { padding: '6px 12px', borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 12, cursor: 'pointer' },
  chipActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  toggle: { display: 'flex', gap: 8 },
  toggleBtn: { flex: 1, padding: '10px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink-muted)', fontSize: 12.5, cursor: 'pointer' },
  toggleBtnActive: { borderColor: 'var(--thread-gold)', color: 'var(--thread-gold)', background: 'var(--thread-gold-soft)' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', margin: '12px 0 4px', cursor: 'pointer' },
  textarea: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--ink)', fontSize: 14, fontFamily: 'inherit', resize: 'none' },
  photoPreviewWrap: { position: 'relative', width: 96, height: 96 },
  photoPreview: { width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' },
  photoRemoveBtn: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
    border: 'none', background: 'var(--slip-rust)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  actions: { display: 'flex', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-muted)', fontSize: 14, cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--plan-brown)', color: 'var(--plan-tan)', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
