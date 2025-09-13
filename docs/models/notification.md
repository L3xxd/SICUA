# Modelo: Notification

Campos (Prisma):
- `id: string`
- `userId: string` y relación `user: User`
- `title: string`
- `message: string`
- `type: string`
- `read: boolean` (default false)
- `createdAt: Date` (default now)
- `relatedRequestId?: string`
