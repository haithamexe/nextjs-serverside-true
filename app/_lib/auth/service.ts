import "server-only";

import { hashPassword } from "./password";
import type { PublicUser, Role, User } from "./types";

// ---------------------------------------------------------------------------
// DEMO STORAGE
// ---------------------------------------------------------------------------
// This uses a server-side in-memory Map as the "database".
// Data is reset whenever the dev server restarts.
//
// To connect a real database, replace the functions below with your ORM/query
// layer (Prisma, Drizzle, raw pg, etc.). The API routes and token logic are
// entirely unchanged — only this file needs to swap.
// ---------------------------------------------------------------------------

const users = new Map<string, User>();

// ---------------------------------------------------------------------------
// Seed — two default accounts for development / demo
// ---------------------------------------------------------------------------
async function seed() {
  const adminHash = await hashPassword("Admin123");
  users.set("admin@example.com", {
    id: "seed-admin-001",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    passwordHash: adminHash,
    createdAt: new Date().toISOString(),
  });

  const userHash = await hashPassword("User1234");
  users.set("user@example.com", {
    id: "seed-user-001",
    email: "user@example.com",
    name: "Regular User",
    role: "user",
    passwordHash: userHash,
    createdAt: new Date().toISOString(),
  });
}

// Run seed once at module load time (server startup)
void seed();

// ---------------------------------------------------------------------------
// CRUD operations — swap these out for real DB calls
// ---------------------------------------------------------------------------

export function findUserByEmail(email: string): User | undefined {
  return users.get(email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) return user;
  }
  return undefined;
}

export function createUser(data: {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}): User {
  const user: User = {
    ...data,
    email: data.email.toLowerCase(),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  users.set(user.email, user);
  return user;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}
