import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils.js';
let users = []; // мок TODO: заменить на бд

export const register = async (req, res) => {
    try {
        const { nickname, email, password, birthday } = req.body;

        if (!nickname || !email || !password || !birthday) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const exists = users.find(u => u.nickname === nickname || u.email === email);
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = {
            id: users.length + 1,
            nickname,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        console.log('Registered user:', { id: newUser.id, nickname: newUser.nickname });

        const token = generateToken({
            id: newUser.id,
            nickname: newUser.nickname,
            email: newUser.email
        });

        res.status(201).json({
            user: {
                id: newUser.id,
                nickname: newUser.nickname,
                email: newUser.email,
                birthday: newUser.birthday
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { login, password } = req.body;

        // Валидация входных данных
        if (!login || !password) {
            return res.status(400).json({ message: 'Login and password are required' });
        }

        const user = users.find(
            u => u.nickname === login || u.email === login
        );

        if (!user) {
            return res.status(401).json({ message: 'Invalid login or password' });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid login or password' });
        }

        const token = generateToken({
            id: user.id,
            nickname: user.nickname,
            email: user.email
        });

        res.json({
            user: {
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                birthday: user.birthday
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};