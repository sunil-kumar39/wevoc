import { useState } from "react";
import { useApp } from "../context/AppContext";
import { forgotPassword, resetPassword } from "../api/auth.api";

export default function LoginPage({ onRegister }) {
    const { login } = useApp();

    // Mode: "login" or "forgot"
    const [mode, setMode] = useState("login");
    const [forgotStep, setForgotStep] = useState(1); // 1: send code, 2: verify & reset

    // Login & Forgot states
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Handle Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!identifier.trim() || !password) {
            setError("Email/Username and password are required");
            return;
        }

        try {
            setLoading(true);
            await login({
                identifier: identifier.trim(),
                password,
            });
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    // Handle Send Reset Code
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!identifier.trim()) {
            setError("Please enter your email or username");
            return;
        }

        try {
            setLoading(true);
            const res = await forgotPassword({ identifier: identifier.trim() });
            const code = res.data?.resetCode;
            if (code) {
                setOtp(code);
                setSuccess(`Reset code generated: ${code}`);
            } else {
                setSuccess("Reset code sent! Please check your email.");
            }
            setForgotStep(2);
        } catch (err) {
            setError(err.message || "Failed to generate reset code");
        } finally {
            setLoading(false);
        }
    };

    // Handle Reset Password Submit
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp.trim()) {
            setError("Please enter the 6-digit reset code");
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setError("New password must be at least 6 characters long");
            return;
        }

        try {
            setLoading(true);
            await resetPassword({
                identifier: identifier.trim(),
                otp: otp.trim(),
                newPassword,
            });

            setSuccess("Password reset successfully! Please login with your new password.");
            setPassword(newPassword);
            setTimeout(() => {
                setMode("login");
                setForgotStep(1);
                setOtp("");
                setNewPassword("");
            }, 1800);
        } catch (err) {
            setError(err.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">🎙</div>
                    <div className="auth-logo-wordmark">
                        We<span>Voc</span>
                    </div>
                </div>

                {mode === "login" ? (
                    <>
                        {/* Header */}
                        <div className="auth-header">
                            <h1>Welcome back</h1>
                            <p>Login to your WeVoc account</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLoginSubmit}>
                            {/* Error */}
                            {error && <div className="auth-error">{error}</div>}
                            {success && <div className="auth-success">{success}</div>}

                            {/* Email or Username */}
                            <div className="form-group">
                                <label htmlFor="identifier">Email or Username</label>
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
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <label htmlFor="password">Password</label>
                                    <button
                                        type="button"
                                        className="auth-link"
                                        onClick={() => {
                                            setError("");
                                            setSuccess("");
                                            setMode("forgot");
                                            setForgotStep(1);
                                        }}
                                        style={{
                                            fontSize: 12,
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                            marginBottom: 6,
                                            color: "var(--accent, #6366f1)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <div style={{ position: "relative" }}>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="current-password"
                                        style={{
                                            width: "100%",
                                            paddingRight: "48px",
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            border: "none",
                                            background: "transparent",
                                            cursor: "pointer",
                                            fontSize: "18px",
                                            padding: "4px",
                                            color: "var(--ink3)",
                                        }}
                                    >
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="auth-button"
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        {/* Register Link */}
                        <div className="auth-footer">
                            <span>Don't have an account?</span>
                            <button
                                type="button"
                                className="auth-link"
                                onClick={onRegister}
                            >
                                Create account
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Forgot Password Header */}
                        <div className="auth-header">
                            <h1>Reset Password</h1>
                            <p>
                                {forgotStep === 1
                                    ? "Enter your email or username to get a reset code"
                                    : "Enter your reset code and set a new password"}
                            </p>
                        </div>

                        {forgotStep === 1 ? (
                            <form onSubmit={handleSendCode}>
                                {error && <div className="auth-error">{error}</div>}
                                {success && <div className="auth-success">{success}</div>}

                                <div className="form-group">
                                    <label htmlFor="forgot-identifier">Email or Username</label>
                                    <input
                                        id="forgot-identifier"
                                        type="text"
                                        placeholder="Enter your email or username"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        autoComplete="username"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="auth-button"
                                    disabled={loading}
                                >
                                    {loading ? "Generating code..." : "Send Reset Code"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetSubmit}>
                                {error && <div className="auth-error">{error}</div>}
                                {success && <div className="auth-success">{success}</div>}

                                <div className="form-group">
                                    <label htmlFor="otp-input">6-Digit Reset Code</label>
                                    <input
                                        id="otp-input"
                                        type="text"
                                        placeholder="e.g. 123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        style={{ letterSpacing: "2px", fontWeight: "600" }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="new-password">New Password</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            id="new-password"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter minimum 6 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{
                                                width: "100%",
                                                paddingRight: "48px",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                                            style={{
                                                position: "absolute",
                                                right: "10px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                                padding: "4px",
                                                color: "var(--ink3)",
                                            }}
                                        >
                                            {showNewPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="auth-button"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting password..." : "Reset Password"}
                                </button>
                            </form>
                        )}

                        {/* Back to Login */}
                        <div className="auth-footer">
                            <span>Remember your password?</span>
                            <button
                                type="button"
                                className="auth-link"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                    setSuccess("");
                                    setForgotStep(1);
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}