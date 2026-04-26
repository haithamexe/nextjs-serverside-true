export type Role = "admin" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
}

/** User shape safe to send to the client — no password hash. */
export type PublicUser = Omit<User, "passwordHash">;

/** Shape of the JWT access token payload. */
export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  type: "access";
}

/** Shape of the JWT refresh token payload. */
export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
}

/** Body returned on login / register / refresh. */
export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

/** Login request body. */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Register request body. */
export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  role?: Role;
}
