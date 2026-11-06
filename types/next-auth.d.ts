import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * توسيع أنواع Auth.js v5 لإضافة id و role.
 * بدون هذا الملف سيرفض TypeScript قراءة session.user.role.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
