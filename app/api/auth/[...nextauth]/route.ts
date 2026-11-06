import { handlers } from "@/auth";

/**
 * جميع مسارات Auth.js: /api/auth/signin, /api/auth/callback/credentials,
 * /api/auth/session, /api/auth/signout, /api/auth/csrf ...
 */
export const { GET, POST } = handlers;
