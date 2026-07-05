import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"), // 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const ticketRepliesTable = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  authorId: integer("author_id").notNull(),
  authorRole: text("author_role").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTicketReplySchema = createInsertSchema(ticketRepliesTable).omit({ id: true, createdAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertTicketReply = z.infer<typeof insertTicketReplySchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
export type TicketReply = typeof ticketRepliesTable.$inferSelect;
