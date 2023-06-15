import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Orders from "../pages/Orders";
import OrderTracker from "../pages/OrderTracker";
import Login from "../pages/Login";
import Registration from "../pages/Registration";
import ForgotPassword from "../pages/ForgotPassword";
import UserProfile from "../pages/UserProfile";
import ActivityHistoryDetails from "../components/UserProfile/ActivityHistoryDetails";
import GoogleMaps from "../pages/GoogleMaps";

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/:orderId" element={<OrderTracker />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/userProfile" element={<UserProfile />} />
      <Route
        path="/activityHistoryDetails/:orderId"
        element={<ActivityHistoryDetails />}
      />
      <Route path="/googleMaps/:address" element={<GoogleMaps />} />
    </Routes>
  );
};

export default Routers;
