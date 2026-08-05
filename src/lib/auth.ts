// ════════════════════════════════════════════════════════════════════
//  Lellina — NextAuth Configuration (Phase 2.14)
//  Credentials provider. Admin bypasses verification gate.
// ════════════════════════════════════════════════════════════════════

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Lellina',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const identifier = credentials.identifier.trim().toLowerCase()

        // Find user by email OR username
        const user = await db.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { username: identifier },
            ],
          },
        })

        if (!user) {
          return null
        }

        // Check ban
        if (user.bannedAt) {
          throw new Error('banned')
        }

        // Verify password
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) {
          return null
        }

        // Update lastLoginAt
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.username || user.email,
          role: user.role,
          isVerified: user.isVerified,
          country: user.country,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.isVerified = (user as any).isVerified
        token.country = (user as any).country
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.isVerified = token.isVerified as boolean
        session.user.country = token.country as string | null
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// ─── Type augmentation for NextAuth session ─────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      isVerified: boolean
      country: string | null
    }
  }

  interface User {
    role?: string
    isVerified?: boolean
    country?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    isVerified?: boolean
    country?: string | null
  }
}
