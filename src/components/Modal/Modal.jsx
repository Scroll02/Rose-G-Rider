import React from "react";
import "./Modal.css";
const Modal = ({
  closeModal,
  handleActionConfirmation,
  selectedAction,
  setCancellationReason,
}) => {
  const handleReasonChange = (event) => {
    setCancellationReason(event.target.value);
  };

  const reasons = [
    "Customer's address not found",
    "Technical or mechanical problems",
    "Long wait time",
    "Customer is unresponsive or unreachable",
    "Unsafe weather conditions",
    "Personal emergency",
  ];

  return (
    <>
      <div className="modal__wrapper">
        <div className="modal__container">
          <div className="modal__header">
            <h6>Confirmation</h6>
          </div>

          <div className="modal__content">
            {selectedAction === "cancel" && (
              <div className="modal__reasons">
                <h6>Select a reason:</h6>
                {reasons.map((reason) => (
                  <label key={reason}>
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      onChange={handleReasonChange}
                    />
                    {reason}
                  </label>
                ))}
              </div>
            )}
            <p>Are you sure you want to make this change?</p>
            <div className="modal__actions">
              <button onClick={handleActionConfirmation}>Yes</button>
              <button onClick={closeModal}>No</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
