CREATE TABLE "reservation_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"weekStart" date NOT NULL,
	"totalBoxes" integer DEFAULT 0 NOT NULL,
	"maleBoxes" integer DEFAULT 0 NOT NULL,
	"femaleBoxes" integer DEFAULT 0 NOT NULL,
	"opensAt" timestamp,
	"closesAt" timestamp,
	"manualClosed" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reservation_availability_weekStart_unique" UNIQUE("weekStart")
);
