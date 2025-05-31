import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(__dirname, '../users.json');

type User = {
    username: string;
    password: string;
    role: 'owner' | 'maintainer';
};

export const loadUsers = (): User[] => {
    const raw = fs.readFileSync(USERS_PATH, 'utf-8');
    return JSON.parse(raw);
};

export const findUser = (username: string): User | undefined => {
    return loadUsers().find(u => u.username === username);
};