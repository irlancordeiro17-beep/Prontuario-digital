// lib/auth.ts — Prontuário Social
// Auth configuration with safe fallback when DATABASE_URL is not configured
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import type { Role } from '@/types'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? 'dev-fallback-secret-prontuario-social',
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // If no DATABASE_URL, reject all logins (use DEV_AUTH_BYPASS instead)
        if (!process.env.DATABASE_URL) {
          console.warn('[Auth] DATABASE_URL not configured. Use DEV_AUTH_BYPASS=true for development.')
          return null
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Dynamic imports to avoid build-time Prisma errors
        const { prisma } = await import('@/lib/prisma')
        const bcrypt = await import('bcryptjs')

        const user = await prisma.user.findUnique({
          where: { email, active: true },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          ubs: user.ubs ?? undefined,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.ubs = (user as any).ubs
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).ubs = token.ubs
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
