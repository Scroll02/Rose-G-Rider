import React from "react";
import "../../style/TitlePageBanner.css";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
const TitlePageBanner = ({ title }) => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1); // Navigate back when the icon is clicked
  };
  return (
    <div className="banner">
      {title === "Order Details" && (
        <ArrowBack
          className="banner__arrowBack"
          onClick={handleGoBack}
          style={{ fontSize: "2rem" }}
        />
      )}
      <h1>{title}</h1>
    </div>
  );
};

export default TitlePageBanner;
