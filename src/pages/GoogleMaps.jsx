import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../style/GoogleMaps.css";
import LoadingIcon from "../assets/gif/loading.gif";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const GoogleMaps = () => {
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const { address } = useParams();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // const getCurrentLocation = () => {
  //   try {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         const { latitude, longitude } = position.coords;
  //         setCurrentLocation({ lat: latitude, lng: longitude });
  //       },
  //       (error) => {
  //         console.log("Error getting current location:", error);
  //       }
  //     );
  //   } catch (error) {
  //     console.log("Error accessing geolocation:", error);
  //   }
  // };

  // useEffect(() => {
  //   getCurrentLocation();
  // }, []);

  const center = useMemo(
    () =>
      currentLocation || { lat: 14.624925629460806, lng: 121.06894819626983 },
    [currentLocation]
  );

  // useEffect(() => {
  //   if (window.google && window.google.maps) {
  //     window.location.reload();
  //   }
  // }, []);

  // useEffect(() => {
  //   if (address) {
  //     const geocoder = new window.google.maps.Geocoder();
  //     geocoder.geocode({ address }, (results, status) => {
  //       if (status === "OK" && results.length > 0) {
  //         const location = results[0].geometry.location;
  //         setDeliveryLocation({ lat: location.lat(), lng: location.lng() });
  //       }
  //     });
  //   }
  // }, [address]);

  console.log(address);

  return (
    <main>
      MAP
      {/* <LoadScript googleMapsApiKey={GOOGLE_API_KEY}>
        <GoogleMap
          mapContainerClassName="map__container"
          center={center}
          zoom={12}
        >
          {currentLocation && <Marker position={currentLocation} />}
          {deliveryLocation && <Marker position={deliveryLocation} />}
        </GoogleMap>
      </LoadScript> */}
    </main>
  );
};

export default GoogleMaps;
