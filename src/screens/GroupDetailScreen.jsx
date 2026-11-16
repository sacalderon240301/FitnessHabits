import { Fragment, useState } from 'react'
import { ArrowLeft, Copy, Camera, Droplet, Check, LogOut, X } from 'lucide-react'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useMyCheckin } from '../hooks/useMyCheckin'
import { useGymGroups } from '../hooks/useGymGroups'
import { todayIso, addDays } from '../lib/date'
import ChallengesSection from '../components/groups/ChallengesSection'
import PhotoPickerButtons from '../components/PhotoPickerButtons'

export default function GroupDetailScreen({ groupId, groups, onBack }) {
  const group = groups.find((g) => g.id === groupId)
  const { members, checkins, loading, reload } = useGroupDetail(groupId)
  const { checkin: myCheckin, checkIn, saving } = useMyCheckin()
  const { leaveGroup } = useGymGroups()

  const [editing, setEditing] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [drankWater, setDrankWater] = useState(myCheckin?.drank_water ?? false)
  const [lightboxUrl, setLightboxUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  const days = Array.from({ length: 7 }, (_, i) => addDays(todayIso(), -(6 - i)))

  const checkinFor = (userId, date) => checkins.find((c) => c.user_id === userId && c.checkin_date === date)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(group?.code ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // portapapeles no disponible — no es crítico
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSaveCheckin = async () => {
    await checkIn({ photoFile, drankWater })
    setEditing(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    reload()
  }

  const handleLeave = async () => {
    if (!window.confirm(`¿Salir de "${group?.name}"? Puedes volver a unirte con el código si cambias de opinión.`)) return
    await leaveGroup(groupId)
    onBack()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn} aria-label="Volver"><ArrowLeft size={18} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={styles.name}>{group?.name ?? 'Grupo'}</h1>
          <button onClick={handleCopyCode} style={styles.codeChip}>
            <Copy size={11} /> {copied ? 'Copiado' : group?.code}
          </button>
        </div>
      </div>

      <div style={styles.scroll}>
        {loading ? (
          <p style={{ color: 'var(--ink-muted)' }}>Cargando...</p>
        ) : (
          <>
            <div style={styles.avatarsRow}>
              {members.map((m) => (
                <div key={m.userId} style={styles.avatarWrap}>
                  <div style={styles.avatar}>{(m.displayName || '?')[0].toUpperCase()}</div>
                  <span style={styles.avatarLabel}>{m.isMe ? 'Tú' : m.displayName}</span>
                </div>
              ))}
              <span style={styles.memberCount}>{members.length} / {group?.maxMembers ?? 4}</span>
            </div>

            <div style={styles.calendarCard}>
              <div style={styles.calendarLegend}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ ...styles.dot, background: 'var(--thread-gold)' }} /> Check-in</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Droplet size={11} color="var(--focus-teal)" /> Agua</span>
              </div>
              <div style={styles.calendarGrid}>
                <div />
                {days.map((d) => (
                  <span key={d} style={styles.dayLabel}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'narrow' })}
                  </span>
                ))}
                {members.map((m) => (
                  <Fragment key={m.userId}>
                    <span style={styles.rowName}>{m.isMe ? 'Tú' : m.displayName}</span>
                    {days.map((d) => {
                      const c = checkinFor(m.userId, d)
                      return (
                        <button
                          key={`${m.userId}-${d}`}
                          style={{ ...styles.cell, background: c ? 'var(--thread-gold-soft)' : 'var(--surface)' }}
                          onClick={() => c?.photo_url && setLightboxUrl(c.photo_url)}
                        >
                          {c && <Check size={10} color="var(--thread-gold)" />}
                          {c?.drank_water && <Droplet size={8} color="var(--focus-teal)" style={{ marginLeft: 2 }} />}
                          {c?.photo_url && <Camera size={9} color="var(--ink-muted)" style={{ marginLeft: 2 }} />}
                        </button>
                      )
                    })}
                  </Fragment>
                ))}
              </div>
            </div>

            <div style={styles.checkinCard}>
              <span style={styles.checkinTitle}>Tu check-in de hoy</span>

              {!editing && myCheckin && !photoFile ? (
                <div style={styles.checkinSummary}>
                  {myCheckin.photo_url && <img src={myCheckin.photo_url} alt="" style={styles.myPhoto} />}
                  <div style={{ flex: 1 }}>
                    <span style={styles.checkinDone}>
                      <Check size={13} color="var(--focus-teal)" /> Ya registraste hoy
                    </span>
                    {myCheckin.drank_water && <span style={styles.checkinWaterTag}><Droplet size={11} /> Tomaste agua</span>}
                  </div>
                  <button onClick={() => setEditing(true)} style={styles.updateLink}>Actualizar</button>
                </div>
              ) : (
                <div style={styles.checkinForm}>
                  {photoPreview ? (
                    <div style={styles.photoPreviewWrap}>
                      <img src={photoPreview} alt="" style={styles.photoPreview} />
                      <button onClick={() => { setPhotoFile(null); setPhotoPreview(null) }} style={styles.photoRemoveBtn}><X size={13} /></button>
                    </div>
                  ) : (
                    <PhotoPickerButtons onPick={handlePhotoChange} />
                  )}
                  <label style={styles.checkboxRow}>
                    <input type="checkbox" checked={drankWater} onChange={(e) => setDrankWater(e.target.checked)} />
                    Hoy tomé agua suficiente
                  </label>
                  <button onClick={handleSaveCheckin} style={styles.submitBtn} disabled={saving}>
                    {saving ? 'Guardando...' : 'Registrar check-in'}
                  </button>
                </div>
              )}
            </div>

            <ChallengesSection
              groupId={groupId}
              members={members}
              myUserId={members.find((m) => m.isMe)?.userId}
            />

            <button onClick={handleLeave} style={styles.leaveBtn}>
              <LogOut size={14} /> Salir del grupo
            </button>
          </>
        )}
      </div>

      {lightboxUrl && (
        <div style={styles.lightboxOverlay} onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" style={styles.lightboxImg} />
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 },
  header: { padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)',
    background: 'var(--surface)', color: 'var(--ink)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
  },
  name: { fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, margin: 0 },
  codeChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4,
    background: 'transparent', border: 'none', color: 'var(--ink-muted)',
    fontFamily: 'var(--font-mono)', fontSize: 11.5, cursor: 'pointer', padding: 0,
  },
  scroll: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  avatarsRow: { display: 'flex', alignItems: 'center', gap: 14 },
  avatarWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  avatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--thread-gold-soft)',
    color: 'var(--thread-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13,
  },
  avatarLabel: { fontSize: 10.5, color: 'var(--ink-muted)' },
  memberCount: { marginLeft: 'auto', fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' },
  calendarCard: { background: 'var(--surface-raised)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  calendarLegend: { display: 'flex', gap: 14, fontSize: 11, color: 'var(--ink-muted)' },
  dot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' },
  calendarGrid: { display: 'grid', gridTemplateColumns: '54px repeat(7, 1fr)', gap: 4, alignItems: 'center' },
  dayLabel: { fontSize: 10.5, color: 'var(--ink-muted)', textAlign: 'center' },
  rowName: { fontSize: 11.5, color: 'var(--ink)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cell: {
    height: 26, borderRadius: 7, border: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer',
  },
  checkinCard: { background: 'var(--surface-raised)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  checkinTitle: { fontSize: 14, fontWeight: 600, color: 'var(--ink)' },
  checkinSummary: { display: 'flex', alignItems: 'center', gap: 12 },
  myPhoto: { width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 },
  checkinDone: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink)' },
  checkinWaterTag: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--focus-teal)', marginTop: 4 },
  updateLink: { background: 'transparent', border: 'none', color: 'var(--thread-gold)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0 },
  checkinForm: { display: 'flex', flexDirection: 'column', gap: 12 },
  photoPreviewWrap: { position: 'relative', width: 96, height: 96 },
  photoPreview: { width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' },
  photoRemoveBtn: {
    position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
    border: 'none', background: 'var(--slip-rust)', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' },
  submitBtn: { padding: '12px', borderRadius: 10, border: 'none', background: 'var(--thread-gold)', color: '#221703', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' },
  leaveBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    background: 'transparent', border: 'none', color: 'var(--slip-rust)', fontSize: 12.5, cursor: 'pointer', padding: 8,
  },
  lightboxOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 60, padding: 24,
  },
  lightboxImg: { maxWidth: '100%', maxHeight: '100%', borderRadius: 12 },
}
