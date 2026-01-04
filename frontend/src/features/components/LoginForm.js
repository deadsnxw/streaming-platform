import { useState } from 'react';
import { authService } from '../../services/authService';

function LoginForm({ onSuccess, onError }) {
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await authService.login(formData);
            onSuccess?.(user);
        } catch (err) {
            onError?.(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label htmlFor="login">Email or Nickname</label>
                <input
                    type="text"
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    placeholder="Email or nickname"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Entering...' : 'Enter'}
            </button>
        </form>
    );
}

export default LoginForm;