import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const requirementSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters'),
    description: z.string().trim().optional(),
    quantity: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val)))
      .refine((val) => val === null || (Number.isFinite(val) && val > 0), {
        message: 'Quantity must be greater than 0',
      }),
    maxPrice: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val)))
      .refine((val) => val === null || (Number.isFinite(val) && val >= 0), {
        message: 'Max price cannot be negative',
      }),
    maxDeliveryDays: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val)))
      .refine((val) => val === null || (Number.isInteger(val) && val >= 0), {
        message: 'Max delivery days must be a non-negative integer',
      }),
    minWarrantyYears: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => (val === '' || val === null || val === undefined ? null : Number(val)))
      .refine((val) => val === null || (Number.isFinite(val) && val >= 0), {
        message: 'Minimum warranty cannot be negative',
      }),
    paymentTerms: z.string().trim().optional(),
    priceWeight: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val) || 0)
      .refine((val) => val >= 0 && val <= 100, {
        message: 'Weight must be between 0 and 100',
      }),
    deliveryWeight: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val) || 0)
      .refine((val) => val >= 0 && val <= 100, {
        message: 'Weight must be between 0 and 100',
      }),
    warrantyWeight: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val) || 0)
      .refine((val) => val >= 0 && val <= 100, {
        message: 'Weight must be between 0 and 100',
      }),
  })
  .refine(
    (data) => {
      const sum = (data.priceWeight || 0) + (data.deliveryWeight || 0) + (data.warrantyWeight || 0);
      return Math.abs(sum - 100) < 0.01;
    },
    {
      message: 'Weights (price, delivery, warranty) must total exactly 100%',
      path: ['warrantyWeight'],
    }
  );

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });
