import React, { useState, useEffect } from "react";
import "../style/Orders.css";
import { Container, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment/moment";
import TitlePageBanner from "../components/UI/TitlePageBanner";
import OrderFood from "../assets/images/order-food.png";
import AvailabilityModal from "../components/Modal/AvailabilityModal";
// Firebase
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";

const Orders = () => {
  const [orderData, setOrderData] = useState([]);
  const [showCurrentOrders, setShowCurrentOrders] = useState(true);
  const [orderHistory, setOrderHistory] = useState([]);
  const [filterMonth, setFilterMonth] = useState("All Months");
  const [filterYear, setFilterYear] = useState("All Years");
  const [availableYears, setAvailableYears] = useState([]);

  const clearOrderData = () => {
    setOrderData([]);
  };

  // Retrieve Users Order Data for Current Orders
  const getCurrentOrdersData = async () => {
    if (auth.currentUser) {
      const ordersRef = collection(db, "UserOrders");
      const querySnapshot = await getDocs(
        query(
          ordersRef,
          where("orderStatus", "in", ["Prepared", "Delivery"]),
          where("orderPayment", "!=", "Cash On Pickup")
        )
      );

      const filteredOrders = querySnapshot.docs.map((doc) => doc.data());
      setOrderData(filteredOrders);

      // Subscribe to real-time updates
      onSnapshot(
        query(
          ordersRef,
          where("orderStatus", "in", ["Prepared", "Delivery"]),
          where("orderPayment", "!=", "Cash On Pickup")
        ),
        (snapshot) => {
          const updatedOrders = snapshot.docs.map((doc) => doc.data());
          setOrderData(updatedOrders);
        }
      );
    }
  };

  // Retrieve Users Order Data for Order History
  const getOrderHistoryData = async () => {
    if (auth.currentUser) {
      const ordersRef = collection(db, "UserOrders");

      const querySnapshot = await getDocs(
        query(
          ordersRef,
          where("orderStatus", "in", ["Delivered", "Cancelled"]),
          where("deliveryRiderID", "==", auth.currentUser.uid)
        )
      );
      const allOrders = querySnapshot.docs.map((doc) => doc.data());

      let filteredOrders = allOrders;
      if (filterMonth !== "All Months" || filterYear !== "All Years") {
        filteredOrders = allOrders.filter((order) => {
          const orderMonth = moment(order.orderDate.toDate()).format("MMMM");
          const orderYear = moment(order.orderDate.toDate()).format("YYYY");

          const isMonthMatch =
            filterMonth === "All Months" ||
            orderMonth.toLowerCase() === filterMonth.toLowerCase();
          const isYearMatch =
            filterYear === "All Years" || orderYear === filterYear;

          return isMonthMatch && isYearMatch;
        });
      }

      // Sort the filtered orders manually in descending order based on order date
      filteredOrders.sort(
        (a, b) => b.orderDate.toDate() - a.orderDate.toDate()
      );

      setOrderHistory(filteredOrders);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (showCurrentOrders) {
          getCurrentOrdersData();
        } else {
          getOrderHistoryData();
        }
      } else {
        clearOrderData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [showCurrentOrders]);

  useEffect(() => {
    getOrderHistoryData();
  }, []);

  useEffect(() => {
    getOrderHistoryData();
  }, [filterMonth, filterYear]);

  // Accept Order button function
  const navigate = useNavigate();
  const acceptOrder = async (orderId) => {
    try {
      // Get the user's first name and last name from the UserData
      const userDoc = await getDoc(doc(db, "UserData", auth.currentUser.uid));
      const userData = userDoc.data();
      const firstName = userData.firstName;
      const lastName = userData.lastName;

      // Update the UserOrders collection
      const orderDocRef = doc(db, "UserOrders", orderId);
      await updateDoc(orderDocRef, {
        orderStatus: "Delivery",
        deliveryRiderName: `${firstName} ${lastName}`,
        deliveryRiderID: auth.currentUser.uid,
      });
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.log("Error accepting order:", error);
    }
  };

  // Handle current orders button
  const handleCurrentOrdersClick = () => {
    setShowCurrentOrders(true);
  };

  // Handle order history button
  const handleOrderHistoryClick = () => {
    setShowCurrentOrders(false);
  };

  // Available years
  useEffect(() => {
    // Fetch available years from the database
    const fetchAvailableYears = async () => {
      const ordersRef = collection(db, "UserOrders");
      const querySnapshot = await getDocs(ordersRef);
      const years = new Set();

      querySnapshot.forEach((doc) => {
        const orderYear = moment(doc.data().orderDate.toDate()).format("YYYY");
        years.add(orderYear);
      });

      setAvailableYears(Array.from(years));
    };

    fetchAvailableYears();
  }, [orderHistory]);
  // Months
  const months = [
    "All Months",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === "filterMonth") {
      setFilterMonth(value);
    } else if (name === "filterYear") {
      setFilterYear(value);
    }
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    getOrderHistoryData();
  };

  return (
    <main>
      <Container>
        <Row>
          <Col lg="12">
            <div className="orderCards_buttons">
              <button
                className={showCurrentOrders ? "active" : ""}
                onClick={handleCurrentOrdersClick}
              >
                <h1>Current Orders</h1>
              </button>
              <button
                className={!showCurrentOrders ? "active" : ""}
                onClick={handleOrderHistoryClick}
              >
                <h1>Order History</h1>
              </button>
            </div>

            {showCurrentOrders ? (
              // Current Orders
              <>
                {orderData.length === 0 ? (
                  // Empty Orders
                  <div className="order__now">
                    <img src={OrderFood} alt="Order-now-img" />
                    <h1>You don't have any incoming orders yet.</h1>
                    <h1>
                      Once orders come in, their status will be displayed here.
                    </h1>
                  </div>
                ) : (
                  // Orders not empty
                  <div className="orderCards__container ">
                    {orderData.map((order, index) => {
                      return (
                        <Col lg="12" md="12" sm="12" xs="12">
                          <Row>
                            <article className="orderCard">
                              <Link
                                to={`/orders/${order.orderId}`}
                                className=" no-underline"
                                key={index}
                              >
                                <div className="orderCard__header">
                                  <h5>Order ID: {order.orderId}</h5>
                                  <h5
                                    className={`${
                                      order.orderStatus === "Pending"
                                        ? "pending"
                                        : order.orderStatus === "Delivery"
                                        ? "delivery"
                                        : order.orderStatus === "Prepared"
                                        ? "prepared"
                                        : order.orderStatus === "Confirmed"
                                        ? "confirmed"
                                        : ""
                                    }`}
                                  >
                                    {order.orderStatus}
                                  </h5>
                                </div>
                                <div className="orderCard__content">
                                  {/* Delivery Rider */}
                                  {order.deliveryRiderName && (
                                    <p>
                                      Delivery Rider: {order.deliveryRiderName}
                                    </p>
                                  )}
                                  {/* Payment Method */}
                                  <p>
                                    Payment Method:&nbsp;
                                    <span>{order.orderPayment}</span>
                                  </p>
                                  {/* Order Date */}
                                  <p>
                                    Order Date:&nbsp;
                                    {order.orderDate
                                      ? moment(order.orderDate.toDate()).format(
                                          "MMM D, YYYY h:mm A"
                                        )
                                      : null}
                                  </p>
                                  {/* Total Amount */}
                                  <p>
                                    Total: ₱
                                    {parseFloat(order.orderTotalCost)
                                      .toFixed(2)
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </p>
                                </div>
                              </Link>

                              <div className="orderCard__actions">
                                {order.deliveryRiderID ? null : (
                                  <button
                                    onClick={() => acceptOrder(order.orderId)}
                                  >
                                    Accept Order
                                  </button>
                                )}
                              </div>
                            </article>
                          </Row>
                        </Col>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              // Order History
              <>
                <div>
                  <form onSubmit={handleFilterSubmit} className="date__form">
                    <select
                      name="filterMonth"
                      value={filterMonth}
                      onChange={handleFilterChange}
                      className="date__filter"
                    >
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      name="filterYear"
                      value={filterYear}
                      onChange={handleFilterChange}
                      className="date__filter"
                    >
                      <option value="All Years">All Years</option>
                      {availableYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </form>
                </div>
                {orderHistory.length === 0 ? (
                  // Empty Order History
                  <div className="order__now">
                    <img src={OrderFood} alt="Order-now-img" />
                    <h1>You don't have any order history yet.</h1>
                  </div>
                ) : (
                  // Order History not empty
                  <div className="orderCards__container ">
                    {orderHistory.map((order, index) => {
                      return (
                        <Col lg="12" md="12" sm="12" xs="12">
                          <Row>
                            <article className="orderCard">
                              <Link
                                to={`/orders/${order.orderId}`}
                                className=" no-underline"
                                key={index}
                              >
                                <div className="orderCard__header">
                                  <h5>Order ID: {order.orderId}</h5>
                                  <h5
                                    className={`${
                                      order.orderStatus === "Delivered"
                                        ? "delivered"
                                        : order.orderStatus === "Cancelled"
                                        ? "cancelled"
                                        : ""
                                    }`}
                                  >
                                    {order.orderStatus}
                                  </h5>
                                </div>
                                <div className="orderCard__content">
                                  {/* Delivery Rider */}
                                  {order.deliveryRiderName && (
                                    <p>
                                      Delivery Rider: {order.deliveryRiderName}
                                    </p>
                                  )}
                                  {/* Payment Method */}
                                  <p>
                                    Payment Method:&nbsp;
                                    <span>{order.orderPayment}</span>
                                  </p>
                                  {/* Order Date */}
                                  <p>
                                    Order Date:&nbsp;
                                    {order.orderDate
                                      ? moment(order.orderDate.toDate()).format(
                                          "MMM D, YYYY h:mm A"
                                        )
                                      : null}
                                  </p>
                                  {/* Total Amount */}
                                  <p>
                                    Total: ₱
                                    {parseFloat(order.orderTotalCost)
                                      .toFixed(2)
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </p>
                                </div>
                              </Link>
                            </article>
                          </Row>
                        </Col>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Orders;
