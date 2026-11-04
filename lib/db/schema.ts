import { boolean, date, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(), name: text('name').notNull(), email: text('email').notNull().unique(), emailVerified: boolean('emailVerified').notNull().default(false), image: text('image'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})
export const session = pgTable('session', {
  id: text('id').primaryKey(), expiresAt: timestamp('expiresAt').notNull(), token: text('token').notNull().unique(), createdAt: timestamp('createdAt').notNull(), updatedAt: timestamp('updatedAt').notNull(), ipAddress: text('ipAddress'), userAgent: text('userAgent'), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})
export const account = pgTable('account', {
  id: text('id').primaryKey(), accountId: text('accountId').notNull(), providerId: text('providerId').notNull(), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }), accessToken: text('accessToken'), refreshToken: text('refreshToken'), idToken: text('idToken'), accessTokenExpiresAt: timestamp('accessTokenExpiresAt'), refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'), scope: text('scope'), password: text('password'), createdAt: timestamp('createdAt').notNull(), updatedAt: timestamp('updatedAt').notNull(),
})
export const verification = pgTable('verification', {
  id: text('id').primaryKey(), identifier: text('identifier').notNull(), value: text('value').notNull(), expiresAt: timestamp('expiresAt').notNull(), createdAt: timestamp('createdAt'), updatedAt: timestamp('updatedAt'),
})
export const reservationAvailability = pgTable('reservation_availability', {
  id: serial('id').primaryKey(), weekStart: date('weekStart').notNull().unique(), totalBoxes: integer('totalBoxes').notNull().default(0), maleBoxes: integer('maleBoxes').notNull().default(0), femaleBoxes: integer('femaleBoxes').notNull().default(0), opensAt: timestamp('opensAt'), closesAt: timestamp('closesAt'), manualClosed: boolean('manualClosed').notNull().default(false), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(), userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }), customerName: text('customerName').notNull(), phone: text('phone').notNull(), email: text('email').notNull(), deliveryDate: date('deliveryDate').notNull(), quantity: integer('quantity').notNull(), gender: text('gender').notNull().default('Machos'), department: text('department'), city: text('city'), address: text('address'), postalCode: text('postalCode'), recipientName: text('recipientName'), recipientPhone: text('recipientPhone'), cancellationRequestedAt: timestamp('cancellationRequestedAt'), status: text('status').notNull().default('pending'), notes: text('notes'), createdAt: timestamp('createdAt').notNull().defaultNow(), updatedAt: timestamp('updatedAt').notNull().defaultNow(),
}, (table) => [index('reservations_user_id_idx').on(table.userId)])
