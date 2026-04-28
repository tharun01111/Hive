import bcrypt from 'bcryptjs'
import prisma from '../lib/prisma.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js'

const REFRESH_TOKEN_EXPIRY_DAYS = 7

const getRefreshExpiry = () => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS)
  return expiresAt
}

export const registerUser = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    throw { status: 409, message: 'Email already in use' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  return user
}

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (!user) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid email or password' }
  }

  const { password: _password, ...safeUser } = user
  return safeUser
}

export const generateTokenPair = async (userId) => {
  const accessToken = generateAccessToken(userId)
  const refreshToken = generateRefreshToken(userId)

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      expiresAt: getRefreshExpiry(),
    },
  })

  return { accessToken, refreshToken }
}

export const rotateRefreshToken = async (token) => {
  let payload
  try {
    payload = verifyRefreshToken(token)
  } catch {
    throw { status: 401, message: 'Invalid refresh token' }
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } })

  if (!stored || stored.expiresAt < new Date()) {
    throw { status: 401, message: 'Refresh token invalid or expired' }
  }

  await prisma.refreshToken.delete({ where: { token } })

  const newAccessToken = generateAccessToken(payload.userId)
  const newRefreshToken = generateRefreshToken(payload.userId)

  await prisma.refreshToken.create({
    data: {
      userId: payload.userId,
      token: newRefreshToken,
      expiresAt: getRefreshExpiry(),
    },
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const revokeRefreshToken = async (token) => {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } })
  }
}

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw { status: 404, message: 'User not found' }
  }

  return user
}