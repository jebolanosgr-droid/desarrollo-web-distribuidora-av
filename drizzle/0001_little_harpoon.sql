ALTER TABLE "reservations" ADD COLUMN "gender" text DEFAULT 'Machos' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "postalCode" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "recipientName" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "recipientPhone" text;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "cancellationRequestedAt" timestamp;