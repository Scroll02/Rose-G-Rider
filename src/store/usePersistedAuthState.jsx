import { useEffect, useState } from "react";
import { auth } from "../firebase";

export const usePersistedAuthState = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array ensures the effect is only run once

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []); // Empty dependency array ensures the effect is only run once

  return user;
};
