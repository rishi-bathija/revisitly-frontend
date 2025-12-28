import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, LogIn, Home } from "lucide-react";
import { updateReminderFromEmail, verifyReminderToken } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";

const EmailReminder = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [remindAt, setRemindAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // From token verification
    const [ownerEmail, setOwnerEmail] = useState(null);
    const [ownerMatches, setOwnerMatches] = useState(false);

    // Track if update was already completed in this session
    const [alreadyUpdated, setAlreadyUpdated] = useState(false);

    const getLocalNowForMin = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    };

    const getLoggedInEmail = () => {
        if (user?.email) return user.email;
        try {
            const local = localStorage.getItem("user");
            if (local) {
                const parsed = JSON.parse(local);
                return parsed.email || null;
            }
        } catch {}
        return null;
    };

    useEffect(() => {
        // Check if this reminder was already updated in this session
        const sessionKey = `reminder_updated_${token}`;
        const wasUpdated = sessionStorage.getItem(sessionKey);
        
        if (wasUpdated === "true") {
            setAlreadyUpdated(true);
            setSuccess(true);
        }

        // Verify token on mount
        let mounted = true;
        (async () => {
            try {
                const res = await verifyReminderToken(token);
                if (!mounted) return;
                if (res.success) {
                    setOwnerEmail(res.ownerEmail || null);
                    const loggedEmail = getLoggedInEmail();
                    setOwnerMatches(Boolean(loggedEmail && res.ownerEmail && loggedEmail.toLowerCase() === res.ownerEmail.toLowerCase()));
                }
            } catch (err) {
                console.error("Token verification failed:", err);
            }
        })();
        return () => { mounted = false; };
    }, [token, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await updateReminderFromEmail({
                token,
                remindAt: new Date(remindAt).toISOString(),
            });

            // Mark as updated in session storage
            sessionStorage.setItem(`reminder_updated_${token}`, "true");
            
            setSuccess(true);
            setAlreadyUpdated(true);
        } catch (err) {
            setError("This reminder link is invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchAccount = async () => {
        try {
            await signOut(auth);
        } catch (err) {
            // ignore firebase signOut errors
        }
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        
        // Navigate to login WITHOUT fromReminder state to prevent loop
        // The user can manually navigate back if needed
        navigate("/login");
    };

    // If already updated and showing success screen
    if (success && alreadyUpdated) {
        return (
            <div className="max-w-md mx-auto mt-16">
                <div className="card text-center">
                    <div className="mb-4">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Reminder Updated!</h2>
                        <p className="text-sm text-gray-600 mt-2">
                            Your reminder has been successfully updated.
                        </p>
                    </div>

                    <div className="space-y-3 mt-6">
                        {ownerMatches ? (
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem(`reminder_updated_${token}`);
                                    navigate("/dashboard");
                                }}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go to Dashboard
                            </button>
                        ) : user ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-2">
                                    You are signed in as <strong>{getLoggedInEmail()}</strong>.
                                    To manage this bookmark, sign in as <strong>{ownerEmail || "the owner"}</strong>.
                                </p>
                                <button
                                    onClick={handleSwitchAccount}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    Switch account to continue
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem(`reminder_updated_${token}`);
                                    navigate("/login");
                                }}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                <LogIn className="h-4 w-4" />
                                Log in to Revisitly
                            </button>
                        )}

                        <button
                            onClick={() => {
                                sessionStorage.removeItem(`reminder_updated_${token}`);
                                navigate("/");
                            }}
                            className="btn-secondary w-full"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show the update form
    return (
        <div className="max-w-md mx-auto mt-16">
            <div className="card">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h1 className="text-xl font-semibold">Update Reminder</h1>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    You're updating a reminder using a secure email link.
                    <br />
                    Only the reminder time can be changed.
                </p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            New Reminder Time
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="datetime-local"
                                required
                                min={getLocalNowForMin()}
                                value={remindAt}
                                onChange={(e) => setRemindAt(e.target.value)}
                                className="input-field pl-9"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? "Updating..." : "Update Reminder"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmailReminder;