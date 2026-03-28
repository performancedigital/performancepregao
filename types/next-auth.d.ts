import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'USER' | 'ADMIN' | 'SUPERADMIN'
      status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      planType: 'FREE' | 'PRO' | 'INFINITY_PLUS'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'USER' | 'ADMIN' | 'SUPERADMIN'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    planType: 'FREE' | 'PRO' | 'INFINITY_PLUS'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'USER' | 'ADMIN' | 'SUPERADMIN'
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    planType: 'FREE' | 'PRO' | 'INFINITY_PLUS'
  }
}
