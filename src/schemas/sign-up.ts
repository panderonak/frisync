import * as z from 'zod';

export const signUpSchema = z
  .object({
    email: z
      .email({ error: 'Please enter a valid email' })
      .check(z.minLength(1, { error: 'Email is required' }))
      .trim(),
    password: z
      .string()
      .check(
        z.minLength(1, { error: 'Password is required' }),
        z.minLength(8, { error: 'Password must be at least 8 characters long' })
      )
      .regex(/[a-zA-Z]/, { error: 'Must contain at least one letter' })
      .regex(/[0-9]/, { error: 'Must contain at least one number' })
      .regex(/[^a-zA-Z0-9]/, {
        error: 'Must contain at least one special character',
      })
      .trim(),
    confirmPassword: z
      .string()
      .check(z.minLength(1, { error: 'Confirm your password' })),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
