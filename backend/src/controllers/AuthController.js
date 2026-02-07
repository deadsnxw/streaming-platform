import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/auth.utils.js";
import {
  findUserByEmailOrNickname,
  createUser,
} from "../db/user.repository.js";

export const register = async (req, res) => {
  try {
    const { nickname, email, password, birthday } = req.body;

    if (!nickname || !email || !password || !birthday) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const exists = await findUserByEmailOrNickname(email);
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser({
      email,
      nickname,
      passwordHash,
      birthDate: birthday,
    });

    const token = generateToken({
      user_id: user.user_id,
      nickname: user.nickname,
      email: user.email,
    });

    res.json({
      user: {
        user_id: user.user_id,
        nickname: user.nickname,
        email: user.email,
        birthday: user.birth_date,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res
        .status(400)
        .json({ message: "Login and password are required" });
    }

    const user = await findUserByEmailOrNickname(login);

    if (!user) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid login or password" });
    }

    const token = generateToken({
      user_id: user.user_id,
      nickname: user.nickname,
      email: user.email,
    });

    res.json({
      user: {
        user_id: user.user_id,
        nickname: user.nickname,
        email: user.email,
        birthday: user.birth_date,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};