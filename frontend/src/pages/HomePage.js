import React from "react";

export default function HomePage({ user }) {
    return (
        <div>
            <h1>Welcome, {user.nickname}!</h1>
        </div>
    );
}