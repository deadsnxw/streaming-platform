import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let users = [];

app.post("/api/register", (req, res) => {
    const { nickname, email, password, birthday } = req.body;
    const exists = users.find(u => u.nickname === nickname || u.email === email);
    if (exists) return res.status(400).json({ message: "User already exists" });

    const newUser = { id: users.length + 1, nickname, email, password, birthday };
    users.push(newUser);
    console.log("Registered users:", users);
    res.status(201).json(newUser);
});

app.post("/api/login", (req, res) => {
    const { login, password } = req.body;
    const user = users.find(
        u => (u.nickname === login || u.email === login) && u.password === password
    );
    if (!user) return res.status(401).json({ message: "Invalid login or password" });

    res.json({
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        birthday: user.birthday,
        token: "fake-jwt-token"
    });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));