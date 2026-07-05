import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessTable = pgTable("business", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("My Business"),
  tagline: text("tagline"),
  description: text("description"),
  logo: text("logo"),
  address: text("address"),
  city: text("city"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  workingHours: text("working_hours"),
  gstNumber: text("gst_number"),
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBusinessSchema = createInsertSchema(businessTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessTable.$inferSelect;
