import { z } from 'zod';

// Priority 1 Security Fix: Input validation schemas

export const consultationAnswerSchema = z.object({
  industry: z.string().trim().min(2, "Industry must be at least 2 characters").max(100, "Industry must be less than 100 characters"),
  goal: z.string().trim().min(2, "Goal must be at least 2 characters").max(200, "Goal must be less than 200 characters"),
  target_audience: z.string().trim().min(5, "Target audience must be at least 5 characters").max(500, "Target audience must be less than 500 characters"),
  service_type: z.string().trim().max(200, "Service type must be less than 200 characters").optional(),
  challenge: z.string().trim().min(10, "Challenge must be at least 10 characters").max(1000, "Challenge must be less than 1000 characters"),
  unique_value: z.string().trim().min(10, "Unique value must be at least 10 characters").max(1000, "Unique value must be less than 1000 characters"),
  offer: z.string().trim().min(5, "Offer must be at least 5 characters").max(500, "Offer must be less than 500 characters"),
});

export const emailSchema = z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters");

export const sessionTokenSchema = z.string().uuid("Invalid session token format");

// Partial schema for updates
export const consultationAnswerUpdateSchema = consultationAnswerSchema.partial();
