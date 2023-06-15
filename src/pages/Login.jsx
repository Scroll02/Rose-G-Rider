import React, { useState, useEffect } from "react";
import "../style/Login.css";
import moment from "moment/moment";

// Icons or  Images
import RoseGLogo from "../assets/logo/footerLogo2.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

// Navigation
import { Link, useNavigate } from "react-router-dom";

// Firebase
import { db, auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  userLogInState,
  userLogOutState,
  selectUser,
  setSignInClicked,
} from "../store/UserSlice/userSlice";
import { fetchBagItems } from "../store/MyBag/bagSlice";

// Toast
import {
  showSuccessToast,
  showInfoToast,
  showErrorToast,
} from "../components/Toast/Toast";

const Login = () => {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Navigation
  const navigate = useNavigate();

  //Redux
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser && authUser.emailVerified === true) {
        // Logged In Action
        dispatch(
          userLogInState({
            email: authUser.email,
            lastSignIn: authUser.metadata.lastSignInTime,
            // emailVerified: authUser.emailVerified.toString(),
          })
        );
        // Clear textfields once successfully logged in
        setEmail("");
        setPassword("");
      } else {
        // Logged Out action
        dispatch(userLogOutState());
        // Clear textfields once successfully logged out
        setEmail("");
        setPassword("");
      }
    });
  }, []);

  // Validation Error Messagge
  const [customErrorMsg, setCustomErrorMsg] = useState("");

  // Update Activity Log Data once login
  const updateActivityLog = async (uid, userData) => {
    const startOfMonth = moment().startOf("month").toISOString();
    const endOfMonth = moment().endOf("month").toISOString();
    const monthDocumentId = moment().format("YYYY-MM");

    const docRef = doc(db, "ActivityLog", monthDocumentId);
    const docSnap = await getDoc(docRef);

    const uniqueId = `${uid}-${Date.now()}`; // Generate a unique ID
    const logData = {
      id: uniqueId,
      uid,
      profileImageUrl: userData.profileImageUrl,
      firstName: userData.firstName,
      lastName: userData.lastName,
      lastLoginAt: userData.lastLoginAt,
    };

    const updatedLogData = { ...logData }; // Create a copy of logData

    if (docSnap.exists()) {
      const activityLogData = docSnap.data().activityLogData || [];
      activityLogData.push(updatedLogData);
      await updateDoc(docRef, { activityLogData });
    } else {
      await setDoc(docRef, { activityLogData: [updatedLogData] });
    }
  };

  // Sign Up Button Function
  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        // Get the current date and time
        const currentDate = new Date();
        const lastLoginAt = currentDate.toISOString();

        // Update user data in Firestore
        const userDocRef = doc(db, "UserData", auth.currentUser.uid);
        updateDoc(userDocRef, {
          lastLoginAt: lastLoginAt, // Update lastLoginAt field
        })
          .then(async () => {
            // Retrieve the user data for activity log
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();

            // Check if user role is "Rider"
            if (userData.role === "Rider") {
              // Update activity log
              await updateActivityLog(auth.currentUser.uid, userData);

              showSuccessToast("You've successfully logged in", 1000);
              navigate("/orders");
              dispatch(fetchBagItems(auth.currentUser.uid));
              // Prevent user from going back to login page
              window.history.pushState(null, "", "/orders");
              window.addEventListener("popstate", function (event) {
                window.history.pushState(null, "", "/orders");
              });
              dispatch(setSignInClicked(true));
            } else {
              showErrorToast("Only riders can sign in", 1000);
              setEmail("");
              setPassword("");
              setCustomErrorMsg("");
            }
          })
          .catch((error) => {
            showErrorToast("Error updating user data", error.message);
            setEmail("");
            setPassword("");
            setCustomErrorMsg("");
          });
      })
      .catch((error) => {
        console.log(error);
        var errorMessage = error.message;
        if (email === "" && password === "") {
          setCustomErrorMsg("Please enter your email address and password");
          setEmail("");
          setPassword("");
        } else if (
          errorMessage ===
          "Firebase: The email address is badly formatted. (auth/invalid-email)."
        ) {
          setCustomErrorMsg("Please enter a valid email address");
          setEmail("");
          setPassword("");
        } else {
          setCustomErrorMsg(
            "Please enter your correct email address or password"
          );
          setEmail("");
          setPassword("");
        }
      });
  };

  return (
    <div className="login__body">
      <div className="login__top">
        <img src={RoseGLogo} alt="Rose G Logo" />
      </div>
      <div className="login__bottom">
        <div className="login__container">
          <h5>Welcome to RoseG Delivery Rider App</h5>

          {/*------------------ Login Content ----------------- */}
          {/*------------------ Validation Error Message ----------------- */}
          {customErrorMsg !== "" && (
            <label className="customErrorMsg">{customErrorMsg}</label>
          )}

          <form className="login__form" onSubmit={handleSignIn}>
            {/*------------------ Email Field ----------------- */}
            <div className="loginForm__group">
              <label htmlFor="email__input">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="youremail@gmail.com"
                id="email__input"
                className="loginForm__input"
                name="email"
                onFocus={() => {
                  setEmailFocus(true);
                  setShowPassword(false);
                  setPasswordFocus(false);
                }}
              />
            </div>

            {/*------------------ Password Field ----------------- */}
            <div className="loginForm__group">
              <label htmlFor="password__input">Password</label>
              <div className="login__input-container">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  id="password__input"
                  className="loginForm__input"
                  onFocus={() => {
                    setEmailFocus(false);
                    setPasswordFocus(true);
                  }}
                />

                {/* Toggle On and Off Eye Icon */}
                <div
                  className="login__input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <VisibilityOffIcon className="visibility-icon" />
                  ) : (
                    <VisibilityIcon className="visibility-icon" />
                  )}
                </div>
              </div>
            </div>
          </form>

          {/*------------------ Sign In Button ----------------- */}
          <button className="signIn__btn mt-3 mb-3" onClick={handleSignIn}>
            Sign In
          </button>

          {/*------------------ Forgot Password ----------------- */}
          <label className="forgotPassTxt mt-2 mb-3">
            <span className="forgotPassTxt">
              <Link to="/forgotPassword">Forgot Password?</Link>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Login;
