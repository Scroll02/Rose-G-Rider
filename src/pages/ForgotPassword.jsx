import React, { useState } from "react";
import "../style/ForgotPassword.css";
import ForgotPasswordImg from "../assets/images/forgot-password.png";
import RoseGLogo from "../assets/logo/footerLogo2.png";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
// Firebase
import { auth, db } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { collection, where, getDocs, query } from "firebase/firestore";
// Toast
import { showErrorToast, showSuccessToast } from "../components/Toast/Toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  /* -------------------- Email Validation -------------------- */
  const [checkValidEmail, setCheckValidEmail] = useState(false);
  const handleCheckEmail = (text) => {
    let re = /\S+@\S+\.\S+/;
    let regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

    setEmail(text);
    if (re.test(text) || regex.test(text)) {
      setCheckValidEmail(false);
    } else {
      setCheckValidEmail(true);
    }
  };

  /* -------------------- Forgot Password Button Function -------------------- */
  const handleSubmit = () => {
    if (email === "") {
      showErrorToast("Please enter your email address", 2000);
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      showErrorToast("Please enter a valid email address format", 2000);
    } else {
      const emailRef = collection(db, "UserData");
      const q = query(emailRef, where("email", "==", email));
      getDocs(q)
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            showErrorToast("Email address not found", 2000);
          } else {
            sendPasswordResetEmail(auth, email)
              .then(() => {
                showSuccessToast(
                  "Password reset email has been sent successfully",
                  3000
                );
                setSuccessMsg(
                  "A password reset email has been sent to your email address. Please check your inbox, including the spam section."
                );
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                showErrorToast(error.message);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          showErrorToast(
            "Failed to check email existence. Please try again later.",
            2000
          );
        });
    }
  };

  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/login"); // Navigate back when the icon is clicked
  };

  return (
    <div className="forgotPassword__body">
      <div className="forgotPassword__top">
        <img src={RoseGLogo} alt="Rose G Logo" />
      </div>
      <div className="forgotPassword_bottom">
        <div className="forgotPassword__container">
          <div className="forgotPassword__header">
            <div className="back__button" onClick={handleGoBack}>
              <ArrowBack style={{ fontSize: "2rem" }} />
            </div>
            <div className="forgotPassword__text">
              <h5>Forgot Password?</h5>
            </div>
          </div>

          <img className="lock__img" src={ForgotPasswordImg} alt="lock-img" />

          <div className="enterEmail__msg">
            <label>
              Enter the email associated with your account and we'll send an
              email with instructions to reset your password
            </label>
          </div>

          <div className="forgotPassForm__group">
            <label htmlFor="email__input">Email</label>
            <input
              value={email}
              onChange={(e) => handleCheckEmail(e.target.value)}
              type="email"
              placeholder="youremail@gmail.com"
              id="email__input"
              className="forgotPassForm__input"
              name="email"
            />
          </div>

          {/*------------------ Email Validation Msg ----------------- */}
          {checkValidEmail ? (
            <label className="forgotPass__errorMsg">
              Please enter a valid email address. Example: sample@domain.com
            </label>
          ) : (
            ""
          )}

          {/* -------------------- Submit Button -------------------- */}
          <button className="submit__btn" onClick={handleSubmit}>
            Submit
          </button>

          {/* -------------------- Success Message -------------------- */}
          {successMsg !== "" && (
            <div className="successMsg">
              <label>{successMsg}</label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
