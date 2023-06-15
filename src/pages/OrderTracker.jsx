import React, { useState, useEffect } from "react";
import "../style/OrderTracker.css";
import { Container, Row, Col } from "reactstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import moment from "moment";
import { Phone, LocationOn } from "@mui/icons-material";
import TitlePageBanner from "../components/UI/TitlePageBanner";
// Modal
import Modal from "../components/Modal/Modal";
// Firebase
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
// Toast
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
} from "../components/Toast/Toast";

const OrderTracker = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Retrieve Order Data
  const [orderData, setOrderData] = useState(null);
  useEffect(() => {
    const getOrder = async () => {
      const orderRef = doc(collection(db, "UserOrders"), orderId);
      const unsubscribe = onSnapshot(orderRef, (snapshot) => {
        if (snapshot.exists()) {
          setOrderData(snapshot.data());
        }
      });
      return () => {
        unsubscribe();
      };
    };
    getOrder();
  }, [orderId]);

  // Retrieve Delivery Fee Value
  const [deliveryFee, setDeliveryFee] = useState(0);
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      const deliveryFeeRef = doc(db, "DeliveryFee", "deliveryFee");
      const deliveryFeeDoc = await getDoc(deliveryFeeRef);
      if (deliveryFeeDoc.exists()) {
        const fee = deliveryFeeDoc.data().value;
        setDeliveryFee(fee);
      }
    };
    fetchDeliveryFee();
  }, []);

  // Call button function
  const handleCallButtonClick = () => {
    window.location.href = `tel:${orderData?.orderContactNumber}`;
  };

  // Google map button function
  // const handleGoogleMapsButtonClick = () => {
  //   const deliveryAddress = orderData?.orderAddress;
  //   if (deliveryAddress) {
  //     const encodedAddress = encodeURIComponent(deliveryAddress);
  //     navigate(`/googleMaps?address=${deliveryAddress}`);
  //   }
  // };

  // Delivered button function
  const handleDeliveredButtonClick = async () => {
    const docRef = doc(db, "UserOrders", orderId);
    const orderDataCopy = { ...orderData };

    // Update orderStatus to "Delivered"
    orderDataCopy.orderStatus = "Delivered";
    orderDataCopy.thankYouModalDisplayed = false;

    // Add productQty to totalSold for each product
    const orderItems = orderDataCopy.orderData;

    for (const item of orderItems) {
      const productRef = doc(collection(db, "ProductData"), item.productId);
      const productDoc = await getDoc(productRef);

      if (productDoc.exists()) {
        const productData = productDoc.data();
        const totalSold = (productData.totalSold || 0) + item.productQty;
        await updateDoc(productRef, { totalSold });
      }
    }

    try {
      await setDoc(docRef, orderDataCopy);
      showSuccessToast("Order Delivered!");
    } catch (error) {
      showErrorToast("Error updating order status: ", error);
    }
  };

  // Cancel button function
  const [cancellationReason, setCancellationReason] = useState(null);
  const handleCancelButtonClick = async () => {
    if (!cancellationReason) {
      // Show error message or handle the absence of a selected reason
      return;
    }
    const docRef = doc(db, "UserOrders", orderId);
    const orderDataCopy = { ...orderData };

    // Update orderStatus to "Cancelled"
    orderDataCopy.orderStatus = "Cancelled";
    orderDataCopy.cancellationReason = cancellationReason;

    try {
      await setDoc(docRef, orderDataCopy);
      showSuccessToast("Order Cancelled!", 2000);
    } catch (error) {
      showErrorToast("Error updating order status: ", 2000, error);
    }
  };

  // Pop up modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);

  const closeModal = () => {
    setShowModal(false);
  };
  const handleActionConfirmation = () => {
    if (selectedAction === "delivered") {
      handleDeliveredButtonClick();
    } else if (selectedAction === "cancel") {
      handleCancelButtonClick();
    }
    setShowModal(false);
  };

  return (
    <main>
      <Container>
        {showModal && (
          <Modal
            closeModal={closeModal}
            handleActionConfirmation={handleActionConfirmation}
            selectedAction={selectedAction}
            setCancellationReason={setCancellationReason}
          />
        )}
        <Row>
          <header>
            <TitlePageBanner title="Order Details" />
          </header>
          {/* Order Details */}
          <Col style={{ margin: "0 10px" }}>
            <Row>
              {/* Order Details */}
              <div className="order__details-container">
                <div className="order__details-header">
                  {/* Order ID */}
                  <h5>Order ID:&nbsp;{orderData?.orderId}</h5>

                  {/* Order Status */}
                  <h5
                    className={`${
                      orderData?.orderStatus === "Pending"
                        ? "pending"
                        : orderData?.orderStatus === "Delivery"
                        ? "delivery"
                        : orderData?.orderStatus === "Prepared"
                        ? "prepared"
                        : orderData?.orderStatus === "Confirmed"
                        ? "confirmed"
                        : orderData?.orderStatus === "Delivered"
                        ? "delivered"
                        : orderData?.orderStatus === "Cancelled"
                        ? "cancelled"
                        : ""
                    }`}
                  >
                    {orderData?.orderStatus}
                  </h5>
                </div>

                {/* Delivery Rider Name */}
                {orderData?.deliveryRiderName && (
                  <div className="order__details-item">
                    <p>Delivery Rider:&nbsp;</p>
                    <span>{orderData?.deliveryRiderName}</span>
                  </div>
                )}

                {/* Reason for Cancellation */}
                {orderData?.cancellationReason && (
                  <div className="order__details-item">
                    <p>Reason for Cancellation:&nbsp;</p>
                    <span>{orderData?.cancellationReason}</span>
                  </div>
                )}

                {/* Payment Method */}
                <div className="order__details-item">
                  <p>Payment Method:&nbsp;</p>
                  <span>{orderData?.orderPayment}</span>
                </div>

                {/* Payment Status */}
                <div className="order__details-item">
                  <p>Payment Status:&nbsp;</p>
                  <span>{orderData?.paymentStatus}</span>
                </div>

                {/* Proof of Payment Issue */}
                {orderData?.proofOfPaymentIssue && (
                  <div className="order__details-item">
                    <p>Proof of Payment Issue:&nbsp;</p>
                    <span>{orderData?.proofOfPaymentIssue}</span>
                  </div>
                )}

                {/* Settlement Options */}
                {orderData?.settlementOptions && (
                  <div className="order__details-item">
                    <p>Settlement Options:&nbsp;</p>
                    <span>{orderData?.settlementOptions}</span>
                  </div>
                )}

                {/* Order Date */}
                <div className="order__details-item">
                  <p>Order Date:&nbsp;</p>
                  <span>
                    {orderData?.orderDate
                      ? moment(orderData?.orderDate.toDate()).format(
                          "MMM D, YYYY h:mm A"
                        )
                      : null}
                  </span>
                </div>

                {/* Delivery Address */}
                <div className="order__details-item">
                  <p>Delivery Address:&nbsp; </p>
                  <span>{orderData?.orderAddress}</span>
                </div>

                {/* Order Note */}
                {orderData?.orderNote && orderData?.orderNote !== "" && (
                  <div className="order__details-item">
                    <p>Note:&nbsp;</p>
                    <span>{orderData?.orderNote}</span>
                  </div>
                )}

                {orderData?.orderStatus !== "Delivered" &&
                  orderData?.orderStatus !== "Cancelled" && (
                    <div className="order__details-actions">
                      <button
                        className="order__details-button"
                        onClick={handleCallButtonClick}
                      >
                        <Phone className="order__details-button-icon" />
                        Call
                      </button>

                      <Link
                        to={`/googleMaps/${orderData?.delieveryAddress}`}
                        className=" no-underline"
                      >
                        <button
                          className="order__details-button"
                          // onClick={handleGoogleMapsButtonClick}
                        >
                          <LocationOn className="order__details-button-icon" />
                          Google Maps
                        </button>
                      </Link>
                    </div>
                  )}
              </div>
            </Row>
          </Col>

          {/* Order Summary */}
          <Col lg="12" md="12">
            <div className="order__summary">
              <h6>Order Summary</h6>
              <hr
                style={{
                  border: "2px solid var(--background-color2)",
                }}
              ></hr>
              {orderData?.orderData.length === 0 ? (
                <h5 className="text-center">Your Bag is empty</h5>
              ) : (
                <table className="table">
                  <tbody>
                    {orderData?.orderData.map((item) => (
                      <Tr item={item} key={item.id} />
                    ))}
                  </tbody>
                </table>
              )}
              <hr
                style={{
                  border: "2px solid var(--background-color2)",
                }}
              ></hr>
              <div className="orderSummary__footer">
                <h6>
                  Subtotal:
                  <span>
                    ₱
                    {parseFloat(
                      orderData?.orderData.reduce(
                        (total, item) => total + item.price * item.productQty,
                        0
                      )
                    )
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
                <h6>
                  Delivery Fee:
                  <span>
                    ₱
                    {parseFloat(deliveryFee)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
                <h6>
                  Total:
                  <span>
                    ₱
                    {parseFloat(orderData?.orderTotalCost)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </h6>
              </div>

              {orderData?.orderStatus === "Delivered" && (
                <h5 className="order__msg order__msg--completed">
                  Order Completed
                </h5>
              )}

              {orderData?.orderStatus === "Cancelled" && (
                <h5 className="order__msg order__msg--cancelled">
                  Order Cancelled
                </h5>
              )}

              {orderData?.orderStatus !== "Delivered" &&
                orderData?.orderStatus !== "Cancelled" && (
                  <div className="orderStatus__actions">
                    <button
                      className="orderStatusBtn__delivered"
                      disabled={orderData?.orderStatus === "Delivered"}
                      onClick={() => {
                        setSelectedAction("delivered");
                        setShowModal(true);
                      }}
                    >
                      Delivered
                    </button>
                    <button
                      className="orderStatusBtn__cancel"
                      disabled={orderData?.orderStatus === "Cancelled"}
                      onClick={() => {
                        setSelectedAction("cancel");
                        setShowModal(true);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

const Tr = (props) => {
  const { productName, totalPrice, productQty } = props.item;

  return (
    <tr>
      <td style={{ width: "20%" }}>{productQty}x</td>
      <td style={{ width: "50%" }}>{productName}</td>
      <td className="text-end" style={{ width: "30%" }}>
        ₱
        {parseFloat(totalPrice)
          .toFixed(2)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      </td>
    </tr>
  );
};

export default OrderTracker;
