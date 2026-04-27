import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false, // false in dev — no HTTPS locally
    sameSite: 'lax', // changed from strict to lax
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  })
}

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    setRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({ accessToken, user });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    setRefreshTokenCookie(res, refreshToken);

    const { password: _password, ...safeUser } = user;

    return res.status(200).json({ accessToken, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const payload = verifyRefreshToken(token);

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!stored || stored.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ error: "Refresh token invalid or expired" });
    }

    await prisma.refreshToken.delete({ where: { token } });

    const newAccessToken = generateAccessToken(payload.userId);
    const newRefreshToken = generateRefreshToken(payload.userId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { userId: payload.userId, token: newRefreshToken, expiresAt },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  res.clearCookie("refreshToken");
  return res.status(200).json({ message: "Logged out successfully" });
};

export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Me error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
