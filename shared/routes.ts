import { z } from 'zod';
import { insertUserSchema, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// Remove password from returned user for safety
export const userResponseSchema = z.custom<typeof users.$inferSelect>().transform(u => {
  const { password, ...rest } = u;
  return rest;
});

export const api = {
  auth: {
    adminLogin: {
      method: 'POST' as const,
      path: '/api/auth/admin/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string()
      }),
      responses: {
        200: z.object({ token: z.string() }),
        401: errorSchemas.unauthorized
      }
    }
  },
  users: {
    register: {
      method: 'POST' as const,
      path: '/api/users/register' as const,
      // The frontend will send FormData, so this schema is mostly for reference of fields
      input: insertUserSchema.extend({
        feeReceipt: z.any().optional(), 
        registrationDetails: z.any().optional(),
      }),
      responses: {
        201: z.object({ message: z.string() }),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict (email exists)
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(userResponseSchema),
        401: errorSchemas.unauthorized
      }
    },
    export: {
      method: 'GET' as const,
      path: '/api/users/export' as const,
      responses: {
        200: z.any(), // File blob
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type AdminLoginInput = z.infer<typeof api.auth.adminLogin.input>;
