import React from "react";

export default function ProfilePage({ user, onLogout }) {
    if (!user) return <div>Not logged in</div>;

    return (
        <div>
            <h1>Profile</h1>
            <p><strong>Nickname:</strong> {user.nickname}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {user.birthday && <p><strong>Birthday:</strong> {user.birthday}</p>}
            <button onClick={() => onLogout?.()}>Logout</button>
        </div>
    );
}
