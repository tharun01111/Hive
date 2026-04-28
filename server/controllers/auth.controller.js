import {
  registerUser,
  loginUser,
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  getUserById,
} from '../services/auth.service.js'
import { handle } from '../utils/controllerHandler.js'

const REFRESH_TOKEN_EXPIRY_DAYS = 7

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  })
}

export const register = handle(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }

  const user = await registerUser({ name, email, password })
  const { accessToken, refreshToken } = await generateTokenPair(user.id)
  setRefreshTokenCookie(res, refreshToken)
  return res.status(201).json({ accessToken, user })
})

export const login = handle(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await loginUser({ email, password })
  const { accessToken, refreshToken } = await generateTokenPair(user.id)
  setRefreshTokenCookie(res, refreshToken)
  return res.status(200).json({ accessToken, user })
})

export const refresh = handle(async (req, res) => {
  const token = req.cookies?.refreshToken

  if (!token) {
    return res.status(401).json({ error: 'No refresh token' })
  }

  const { accessToken, refreshToken } = await rotateRefreshToken(token)
  setRefreshTokenCookie(res, refreshToken)
  return res.status(200).json({ accessToken })
})

export const logout = handle(async (req, res) => {
  const token = req.cookies?.refreshToken
  await revokeRefreshToken(token)
  res.clearCookie('refreshToken')
  return res.status(200).json({ message: 'Logged out successfully' })
})

export const me = handle(async (req, res) => {
  const user = await getUserById(req.userId)
  return res.status(200).json({ user })
})