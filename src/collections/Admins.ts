import { APIError, type CollectionConfig } from 'payload'

import { isActiveAdmin, isAllowedAdminEmail, isOwner, normalizeAdminEmail, ownerOnly, ownerOrSelf, type AdminRole } from '@/access'
import { recordAuditEvent } from '@/modules/audit/server/record-audit'

export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: {
    singular: 'Usuario editorial',
    plural: 'Equipo editorial',
  },
  admin: {
    group: 'Sistema',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'isActive', 'updatedAt'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
  },
  access: {
    admin: ({ req }) => isActiveAdmin(req.user),
    create: ownerOnly,
    read: ownerOrSelf,
    update: ownerOrSelf,
    delete: ownerOnly,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (!isAllowedAdminEmail(user.email) || user.isActive === false) {
          throw new APIError('Cuenta no autorizada para el panel editorial.', 403)
        }
        return user
      },
    ],
    beforeValidate: [
      ({ data, originalDoc }) => {
        const email = data?.email || originalDoc?.email
        if (email && !isAllowedAdminEmail(email)) {
          throw new Error('Solo se permiten correos autorizados de TxDxSecure.')
        }
        if (data?.email) data.email = normalizeAdminEmail(data.email)
        if (data?.expertiseDomains && data.expertiseDomains.length > 3) {
          throw new Error('Puedes seleccionar hasta 3 dominios XOC.')
        }
        return data
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === 'create' && !req.user) {
          data.role = 'owner' satisfies AdminRole
        }

        if (operation === 'update' && !isOwner(req.user)) {
          if (data.email && normalizeAdminEmail(data.email) !== normalizeAdminEmail(originalDoc?.email || '')) {
            throw new Error('Solo un owner puede cambiar el correo de una cuenta.')
          }
          if (data.role !== undefined && data.role !== originalDoc?.role) {
            throw new Error('Solo un owner puede cambiar roles.')
          }
          if (data.isActive !== undefined && data.isActive !== originalDoc?.isActive) {
            throw new Error('Solo un owner puede cambiar el estado de una cuenta.')
          }
          if (data.mustChangePassword !== undefined && data.mustChangePassword !== originalDoc?.mustChangePassword && !data.password) {
            throw new Error('Solo un owner o el cambio de contraseña puede modificar este control.')
          }
        }

        const demotingActiveOwner =
          operation === 'update' &&
          originalDoc?.role === 'owner' &&
          (data.role === 'editor' || data.isActive === false)
        if (demotingActiveOwner) {
          const owners = await req.payload.count({
            collection: 'admins',
            overrideAccess: true,
            where: {
              and: [
                { role: { equals: 'owner' } },
                { isActive: { equals: true } },
                { id: { not_equals: originalDoc.id } },
              ],
            },
          })
          if (!owners.totalDocs) throw new Error('Debe existir al menos un owner activo.')
        }

        if (data.password && operation !== 'create') data.mustChangePassword = false
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const target = await req.payload.findByID({ collection: 'admins', id, overrideAccess: true })
        if (target.role !== 'owner') return

        const owners = await req.payload.count({
          collection: 'admins',
          overrideAccess: true,
          where: {
            and: [
              { role: { equals: 'owner' } },
              { isActive: { equals: true } },
              { id: { not_equals: id } },
            ],
          },
        })
        if (!owners.totalDocs) throw new Error('Debe existir al menos un owner activo.')
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (!isActiveAdmin(req.user)) return
        await recordAuditEvent({
          action: operation === 'create' ? 'admin.created' : 'admin.updated',
          collection: 'admins',
          documentID: String(doc.id),
          payload: req.payload,
          summary: `${operation === 'create' ? 'Creó' : 'Actualizó'} la cuenta ${doc.email}.`,
          user: req.user,
        })
      },
    ],
    afterLogin: [
      async ({ req, user }) => {
        await recordAuditEvent({
          action: 'auth.login',
          collection: 'admins',
          documentID: String(user.id),
          payload: req.payload,
          summary: `Inicio de sesión de ${user.email}.`,
          user,
        })
      },
    ],
    afterError: [
      async ({ req }) => {
        const email = req.data?.email
        if (!isAllowedAdminEmail(email)) return

        const result = await req.payload.find({
          collection: 'admins',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          where: { email: { equals: normalizeAdminEmail(email) } },
        })
        const target = result.docs[0]
        await recordAuditEvent({
          action: 'auth.login_failed',
          collection: 'admins',
          documentID: target ? String(target.id) : undefined,
          metadata: { active: target?.isActive === true },
          payload: req.payload,
          summary: `Intento de inicio de sesión fallido para ${normalizeAdminEmail(email)}.`,
          user: { email: normalizeAdminEmail(email), id: target ? String(target.id) : undefined },
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!isActiveAdmin(req.user)) return
        await recordAuditEvent({
          action: 'admin.deleted',
          collection: 'admins',
          documentID: String(doc.id),
          payload: req.payload,
          summary: `Eliminó la cuenta ${doc.email}.`,
          user: req.user,
        })
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'publicTitle',
      type: 'text',
      label: 'Cargo público',
      admin: {
        description:
          'Cargo que se muestra como firma del autor en los artículos (ej.: Ingeniero de seguridad).',
        width: '50%',
      },
      maxLength: 80,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol de acceso',
      defaultValue: 'editor',
      options: [
        { label: 'Owner · Administración completa', value: 'owner' },
        { label: 'Editor · Contenido y publicación', value: 'editor' },
      ],
      access: {
        update: ({ req }) => isOwner(req.user),
      },
      admin: {
        description: 'Solo un owner puede cambiar este rol.',
        position: 'sidebar',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Cuenta activa',
      defaultValue: true,
      access: {
        update: ({ req }) => isOwner(req.user),
      },
      admin: {
        description: 'Las cuentas inactivas no pueden iniciar sesión.',
        position: 'sidebar',
      },
    },
    {
      name: 'mustChangePassword',
      type: 'checkbox',
      label: 'Exigir cambio de contraseña',
      defaultValue: true,
      access: {
        update: ({ req }) => isOwner(req.user),
      },
      admin: {
        description: 'Redirige al usuario a la gestión de seguridad al entrar.',
        position: 'sidebar',
      },
    },
    {
      name: 'publicBio',
      type: 'textarea',
      label: 'Biografía pública',
      maxLength: 320,
      admin: {
        description: 'Contexto breve para la ficha pública del equipo.',
      },
    },
    {
      name: 'expertiseDomains',
      type: 'select',
      hasMany: true,
      label: 'Dominios XOC que domina',
      options: [
        { label: '01 · Capital Humano', value: '01' },
        { label: '02 · Endpoints & Workplace', value: '02' },
        { label: '03 · Aplicaciones, APIs & Code', value: '03' },
        { label: '04 · Infraestructura de Cómputo', value: '04' },
        { label: '05 · Cloud & SaaS', value: '05' },
        { label: '06 · Infraestructura de Red', value: '06' },
        { label: '07 · Perímetro de Seguridad', value: '07' },
        { label: '08 · Servicios Externos / IPs Públicas', value: '08' },
        { label: '09 · OT / IoT', value: '09' },
        { label: '10 · Physical Security', value: '10' },
        { label: '11 · Agentic / AI Models', value: '11' },
      ],
      admin: {
        description: 'Selecciona las superficies operacionales que puedes liderar o explicar.',
      },
    },
    {
      name: 'showOnTeam',
      type: 'checkbox',
      label: 'Mostrar este perfil en Equipo',
      defaultValue: true,
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto de perfil',
      admin: {
        description: 'Foto circular que se muestra junto a tu firma en los articulos publicos.',
      },
    },
  ],
}
