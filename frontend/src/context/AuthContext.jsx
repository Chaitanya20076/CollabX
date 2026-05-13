import {
  createContext,
  useEffect,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  browserLocalPersistence,
  reload,
  setPersistence,
} from "firebase/auth";

import {
  doc,
  setDoc,
} from "firebase/firestore";

import {
  auth,
  googleProvider,
  db,
} from "../config/firebase";

export const AuthContext = createContext();

const AUTH_SEEN_KEY = "collabx-auth-seen";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // SIGNUP

  const signup = async (
    username,
    phone,
    email,
    password,
    location
  ) => {
    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const userData = userCredential.user;

    await sendEmailVerification(userData);

    await setDoc(doc(db, "users", userData.uid), {
      uid: userData.uid,
      username,
      phone,
      email,
      verified: false,
      location: location || null,
      createdAt: new Date(),
    });

    return userCredential;
  };

  // LOGIN

  const login = async (
    email,
    password
  ) => {
    await setPersistence(
      auth,
      browserLocalPersistence
    );

    return signInWithEmailAndPassword(
      auth,
      email,
      password
    );
  };

  // GOOGLE LOGIN

  const googleLogin = async (location = null) => {
    await setPersistence(
      auth,
      browserLocalPersistence
    );

    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    const userData = result.user;

    await setDoc(
      doc(db, "users", userData.uid),
      {
        uid: userData.uid,
        username: userData.displayName,
        email: userData.email,
        photo: userData.photoURL,
        verified: true,
        location,
        createdAt: new Date(),
      },
      { merge: true }
    );

    return result;
  };

  // LOGOUT

  const logout = async () => {
    localStorage.removeItem(AUTH_SEEN_KEY);
    return signOut(auth);
  };

  // RESET PASSWORD

  const resetPassword = async (
    email
  ) => {
    return sendPasswordResetEmail(
      auth,
      email
    );
  };

  const resendVerification = async () => {
    if (!auth.currentUser) {
      throw new Error("No authenticated user found");
    }

    return sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return null;

    await reload(auth.currentUser);
    setUser({ ...auth.currentUser });

    return auth.currentUser;
  };

  // AUTH STATE

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;

    const initializeAuth = async () => {
      try {
        await setPersistence(
          auth,
          browserLocalPersistence
        );

        if (typeof auth.authStateReady === "function") {
          await auth.authStateReady();
        }

        if (!active) return;

        unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            localStorage.setItem(AUTH_SEEN_KEY, "true");
          }

          if (!active) return;

          setUser(currentUser);
          setLoading(false);
        });
      } catch (error) {
        console.log("Auth initialization failed", error);
        if (active) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        googleLogin,
        resetPassword,
        resendVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
