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
	CONSTRAINT "reservation_availability_weekStart_unique" UNIQUE("weekStart"),
	CONSTRAINT "reservation_availability_week_start_monday" CHECK (EXTRACT(ISODOW FROM "reservation_availability"."weekStart") = 1),
	CONSTRAINT "reservation_availability_total_boxes_nonnegative" CHECK ("reservation_availability"."totalBoxes" >= 0),
	CONSTRAINT "reservation_availability_male_boxes_range" CHECK ("reservation_availability"."maleBoxes" >= 0 AND "reservation_availability"."maleBoxes" <= "reservation_availability"."totalBoxes"),
	CONSTRAINT "reservation_availability_female_boxes_range" CHECK ("reservation_availability"."femaleBoxes" >= 0 AND "reservation_availability"."femaleBoxes" <= "reservation_availability"."totalBoxes"),
	CONSTRAINT "reservation_availability_time_window" CHECK ("reservation_availability"."opensAt" IS NULL OR "reservation_availability"."closesAt" IS NULL OR "reservation_availability"."closesAt" > "reservation_availability"."opensAt")
);
