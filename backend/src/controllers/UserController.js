import { getAllUsers, getUserById, updateUser } from '../db/user.repository.js';

export const getMe = async (req, res) => {
    const user = await getUserById(req.user.user_id);
    res.json(user);
};

export const getUser = async (req, res) => {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
};

export const getUsers = async (req, res) => {
    const users = await getAllUsers();
    res.json(users);
};

export const updateMe = async (req, res) => {
    const updated = await updateUser(req.user.user_id, req.body);
    res.json(updated);
};
