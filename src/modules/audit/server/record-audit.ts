import type { Payload } from 'payload'

type AuditUser = {
  email?: string | null
  id?: string | null
}

type AuditAction =
  | 'admin.created'
  | 'admin.deleted'
  | 'admin.updated'
  | 'auth.login'
  | 'auth.login_failed'
  | 'media.deleted'
  | 'post.created'
  | 'post.deleted'
  | 'post.published'
  | 'post.unpublished'
  | 'post.updated'

export function recordAuditEvent({
  action,
  collection,
  documentID,
  metadata,
  payload,
  summary,
  user,
}: {
  action: AuditAction
  collection: string
  documentID?: string
  metadata?: Record<string, string | number | boolean | null>
  payload: Payload
  summary: string
  user: AuditUser
}) {
  if (!user.email) return

  void payload
    .create({
      collection: 'audit-logs',
      data: {
        action,
        ...(user.id ? { actor: user.id } : {}),
        actorEmail: user.email,
        metadata,
        summary,
        targetCollection: collection,
        targetID: documentID,
      },
      overrideAccess: true,
    })
    .catch((error) => {
      console.error('[audit] No se pudo registrar el evento.', error instanceof Error ? error.message : String(error))
    })
}
