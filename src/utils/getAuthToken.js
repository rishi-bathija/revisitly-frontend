import { auth } from "./firebase";

export const getAuthToken = async () => {
    const user = auth.currentUser;
    if (user) {
        return await user.getIdToken(true);
    }
    // fallback for credentials login
    return localStorage.getItem('token');
}