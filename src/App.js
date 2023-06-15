import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { useLocation } from "react-router-dom";

import Routes from "./routes/Routers";
import "./App.css";

import Bag from "./pages/Bag";
import { useSelector } from "react-redux";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isForgotPasswordPage = location.pathname === "/forgotPassword";
  const showBag = useSelector((state) => state.bagUi.bagIsVisible);
  const autoCloseTime = 1000;

  return (
    <div>
      {!isLoginPage && !isForgotPasswordPage && <Header />}
      <ToastContainer
        position="top-center"
        autoClose={autoCloseTime}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="custom-toast"
      />
      {showBag && <Bag />}

      <div>
        <Routes />
      </div>
    </div>
  );
}

export default App;
