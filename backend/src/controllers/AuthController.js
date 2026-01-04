let users = []; // мок TODO: заменить на бд

export const register = (req, res) => {
    try {
        const { nickname, email, password, birthday } = req.body;

        const exists = users.find(u => u.nickname === nickname || u.email === email);
        if (exists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = {
            id: users.length + 1,
            nickname,
            email,
            password, // TODO: хешировать пароль ???
            birthday
        };

        users.push(newUser);
        console.log('Registered users:', users);

        res.status(201).json({
            id: newUser.id,
            nickname: newUser.nickname,
            email: newUser.email,
            birthday: newUser.birthday
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const login = (req, res) => {
    try {
        const { login, password } = req.body;

        const user = users.find(
            u => (u.nickname === login || u.email === login) && u.password === password
        );

        if (!user) {
            return res.status(401).json({ message: 'Invalid login or password' });
        }

        // TODO: имплементировать настоящий JWT
        res.json({
            id: user.id,
            nickname: user.nickname,
            email: user.email,
            birthday: user.birthday,
            token: 'fake-jwt-token'
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};