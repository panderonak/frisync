import * as z from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: 'Please enter a valid email' }).trim(),
  password: z
    .string()
    .check(z.minLength(1, { error: 'Password is required' }))
    .trim(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
