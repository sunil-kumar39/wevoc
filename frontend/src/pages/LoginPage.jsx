import { useState } from "react";
import { useApp } from "../context/AppContext";


export default function LoginPage({ onRegister }) {

    const { login } = useApp();


    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!identifier.trim() || !password) {
            setError("Email/Username and password are required");
            return;
        }

        try {
            setLoading(true);
            await login({
                identifier: identifier.trim(),
                password
            });
        } catch (error) {
            setError(
                error.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        🎙
                    </div>
                    <div className="auth-logo-wordmark">
                        We<span>Voc</span>
                    </div>
                </div>

                {/* Header */}
                <div className="auth-header">
                    <h1>
                        Welcome back
                    </h1>
                    <p>
                        Login to your WeVoc account
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    {/* Error */}
                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {/* Email or Username */}
                    <div className="form-group">
                        <label htmlFor="identifier">
                            Email or Username
                        </label>
                        <input
                            id="identifier"
                            type="text"
                            placeholder="Enter your email or @username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            autoComplete="username"
                        />
                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>


                        <div
                            style={{
                                position:
                                    "relative"
                            }}
                        >

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                autoComplete="current-password"
                                style={{
                                    width: "100%",
                                    paddingRight: "48px"
                                }}
                            />


                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (prev) =>
                                            !prev
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                style={{
                                    position:
                                        "absolute",
                                    right: "10px",
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    border: "none",
                                    background:
                                        "transparent",
                                    cursor:
                                        "pointer",
                                    fontSize:
                                        "18px",
                                    padding:
                                        "4px",
                                    color:
                                        "var(--ink3)"
                                }}
                            >

                                {showPassword
                                    ? "🙈"
                                    : "👁️"}

                            </button>

                        </div>

                    </div>


                    {/* Login Button */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>


                </form>


                {/* Register */}

                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={onRegister}
                    >
                        Create account
                    </button>

                </div>


            </div>

        </div>

    );

}