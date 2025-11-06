"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

export default function LabRadiologyPage() {
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [viewReportModal, setViewReportModal] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [reportTitle, setReportTitle] = useState("Lab Report");
  const [patients, setPatients] = useState([]);
  const [labOrders, setLabOrders] = useState([]);

  const toggleNewOrderModal = () => setNewOrderModal(!newOrderModal);
  const toggleViewReportModal = (title = "Lab Report", content = "") => {
    setReportTitle(title);
    setReportContent(content);
    setViewReportModal(!viewReportModal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, labsRes] = await Promise.all([
          fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients"),
          fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/lab-orders"),
        ]);
        setPatients(await patientsRes.json());
        setLabOrders(await labsRes.json());
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  const handleNewOrderSubmit = async (e) => {
    e.preventDefault();
    const patientId = document.getElementById("lab-patient-id").value;
    const clinicalNotes = document.getElementById("lab-clinical-notes").value;
    const testId = document.getElementById("lab-test-id").value;
    const selectedTest = [
      { id: "cbc", name: "Complete Blood Count (CBC)", type: "Lab" },
      { id: "bmp", name: "Basic Metabolic Panel (BMP)", type: "Lab" },
      { id: "crp", name: "C-Reactive Protein (CRP)", type: "Lab" },
      { id: "urine", name: "Urinalysis", type: "Lab" },
      { id: "xray_chest", name: "X-Ray (Chest)", type: "Radiology" },
      { id: "us_ab", name: "Ultrasound (Abdomen)", type: "Radiology" },
    ].find((t) => t.name === testId);

    const testName = selectedTest?.name || "";
    const testType = selectedTest?.type || "";

    if (!patientId || !testName) return alert("Please fill all required fields.");

    try {
      const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, testName, testType, clinicalNotes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");

      alert("Lab/Radiology order created successfully!");
      setNewOrderModal(false);
      setLabOrders([data, ...labOrders]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      <Header />
      <main className="body">
        {/* === Lab & Radiology Orders Card === */}
        <div className="card-container"
       style={{ maxWidth: "1280px", margin: "16px auto" }}>
          <div className="card-header">
            <h2>Lab & Radiology Orders</h2>
            <div className="right-controls">
              <input
                type="text"
                placeholder="🔍 Search by patient name or test..."
                className="search-input"
              />
              <button className="add-btn" onClick={toggleNewOrderModal}>
                ＋ New Order
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Date Ordered</th>
                  <th>Test / Scan</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.patient_name}</td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>{order.test_name}</td>
                    <td>{order.test_type}</td>
                    <td>
                      <span
                        className={`status ${
                          order.status === "Completed"
                            ? "available"
                            : order.status === "Pending"
                            ? "low"
                            : "out"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="link-btn"
                        onClick={() =>
                          toggleViewReportModal(order.test_name, order.report)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-controls">
              <button>Previous</button>
              <span>Page 1</span>
              <button>Next</button>
              <select defaultValue="10">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
        </div>

        {/* === New Lab Order Modal === */}
        {newOrderModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>New Lab / Radiology Order</h2>
                <button onClick={toggleNewOrderModal} className="close-btn">
                  &times;
                </button>
              </div>

              <form onSubmit={handleNewOrderSubmit} className="modal-form">
                <div className="form-grid">
                  <div>
                    <label>Patient</label>
                    <select id="lab-patient-id" required>
                      <option value="">-- Select Patient --</option>
                      {patients.length > 0 ? (
                        patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} (
                            {new Date().getFullYear() -
                              new Date(p.dob).getFullYear()}
                            {" yrs"})
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading patients...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label>Test / Scan</label>
                    <select id="lab-test-id" required>
                      <option value="">-- Select Test / Scan --</option>
                      {[
                        { id: "cbc", name: "Complete Blood Count (CBC)", type: "Lab" },
                        { id: "bmp", name: "Basic Metabolic Panel (BMP)", type: "Lab" },
                        { id: "crp", name: "C-Reactive Protein (CRP)", type: "Lab" },
                        { id: "urine", name: "Urinalysis", type: "Lab" },
                        { id: "xray_chest", name: "X-Ray (Chest)", type: "Radiology" },
                        { id: "us_ab", name: "Ultrasound (Abdomen)", type: "Radiology" },
                      ].map((test) => (
                        <option key={test.id} value={test.name}>
                          {test.name} — {test.type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Clinical Notes</label>
                    <textarea
                      id="lab-clinical-notes"
                      placeholder="e.g., Persistent cough, check for infection..."
                    ></textarea>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  Place Order
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === View Report Modal === */}
        {viewReportModal && (
          <div className="modal-overlay">
            <div className="modal-box wide">
              <div className="modal-header">
                <h2>{reportTitle}</h2>
                <button
                  onClick={() => setViewReportModal(false)}
                  className="close-btn"
                >
                  &times;
                </button>
              </div>

              <div className="report-box">
                {reportContent || "No report available."}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
