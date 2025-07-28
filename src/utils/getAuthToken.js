import { auth } from "./firebase";

export const getAuthToken = async () => {
    const user = auth.currentUser;
    console.log('user at getauthtoken', user);

    if (user) {
        return await user.getIdToken(true);
    }
    // fallback for credentials login
    const userObjStr = localStorage.getItem('user');
    if (userObjStr) {
        try {
            const userObj = JSON.parse(userObjStr);
            return userObj.token;
        } catch {
            return null;
        }
    }
    return null;
}