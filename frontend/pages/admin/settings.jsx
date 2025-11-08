"use client";
import { useState, useEffect } from "react";
import Header from "../../components/layout/admin/Header";
import axios from "axios";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("billing-codes");

  // -----------------------------
  // Billing Codes
  // -----------------------------
  const [billingCodes, setBillingCodes] = useState([]);
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [activeBillingId, setActiveBillingId] = useState(null);

  // -----------------------------
  // Lab Tests
  // -----------------------------
  const [labTests, setLabTests] = useState([]);
  const [labModalOpen, setLabModalOpen] = useState(false);
  const [activeLabId, setActiveLabId] = useState(null);

  // -----------------------------
  // Load data on mount
  // -----------------------------
  useEffect(() => {
    fetchBillingCodes();
    fetchLabTests();
  }, []);

  const fetchBillingCodes = async () => {
    try {
      const res = await axios.get("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/billing");
      setBillingCodes(res.data);
    } catch (err) {
      console.error("Error loading billing codes:", err);
    }
  };

  const fetchLabTests = async () => {
    try {
      const res = await axios.get("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/labs");
      setLabTests(res.data);
    } catch (err) {
      console.error("Error loading lab tests:", err);
    }
  };

  // -----------------------------
  // Modal helpers
  // -----------------------------
  const activeBilling = billingCodes.find((b) => b.id === activeBillingId);
  const activeLab = labTests.find((l) => l.id === activeLabId);

  const openBillingModal = (id = null) => {
    setActiveBillingId(id ?? null);
    setBillingModalOpen(true);
  };
  const closeBillingModal = () => {
    setActiveBillingId(null);
    setBillingModalOpen(false);
  };

  const openLabModal = (id = null) => {
    setActiveLabId(id ?? null);
    setLabModalOpen(true);
  };
  const closeLabModal = () => {
    setActiveLabId(null);
    setLabModalOpen(false);
  };

  // -----------------------------
  // Save Handlers
  // -----------------------------
  const handleBillingSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const code = form.elements["billing-code"].value;
    const description = form.elements["billing-desc"].value;
    const cost = parseFloat(form.elements["billing-cost"].value);

    try {
      await axios.post("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/billing", {
        id: activeBillingId,
        code,
        description,
        cost,
      });
      await fetchBillingCodes();
      closeBillingModal();
    } catch (err) {
      console.error("Error saving billing code:", err);
      alert("Failed to save billing code.");
    }
  };

  const handleLabSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.elements["lab-test-name"].value;
    const type = form.elements["lab-test-type"].value;

    try {
      await axios.post("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/labs", {
        id: activeLabId,
        name,
        type,
      });
      await fetchLabTests();
      closeLabModal();
    } catch (err) {
      console.error("Error saving lab test:", err);
      alert("Failed to save lab test.");
    }
  };

  // -----------------------------
  // JSX UI
  // -----------------------------
  return (
    <>
      <Header />
      {/* Replaced 'p-6' with 'container' */}
      <div className="page active container">
        <div className="card">
          <h2>System Settings</h2>

          {/* Tabs */}
          <div className="tabs" style={{ display: "flex", gap: "12px", margin: "16px 0" }}>
            <div
              className={`tab ${activeTab === "billing-codes" ? "active" : ""}`}
              onClick={() => setActiveTab("billing-codes")}
              style={{ cursor: "pointer" }}
            >
              💰 Billing Codes
            </div>
            <div
              className={`tab ${activeTab === "lab-tests" ? "active" : ""}`}
              onClick={() => setActiveTab("lab-tests")}
              style={{ cursor: "pointer" }}
            >
              🔬 Lab Tests
            </div>
          </div>

          {/* Billing Codes Tab */}
          {activeTab === "billing-codes" && (
            <div className="tab-content">
              <div className="row" style={{ alignItems: "center", marginBottom: 12 }}>
                <h3>Manage Billing Codes</h3>
                <button className="btn ok right" onClick={() => openBillingModal()}>
                  ＋ New Code
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                 <table className="table" className="table" id="billing-codes-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingCodes.map((b) => (
                      <tr key={b.id}>
                        <td>{b.code}</td>
                        <td>{b.description}</td>
                        <td>₹{b.cost}</td>
                        <td>
                          <button className="btn ok" onClick={() => openBillingModal(b.id)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Lab Tests Tab */}
          {activeTab === "lab-tests" && (
            <div className="tab-content">
              <div className="row" style={{ alignItems: "center", marginBottom: 12 }}>
                <h3>Manage Lab Test Catalog</h3>
                <button className="btn ok right" onClick={() => openLabModal()}>
                  ＋ New Test
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                 <table className="table" id="lab-tests-table">
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTests.map((l) => (
                      <tr key={l.id}>
                        <td>{l.name}</td>
                        <td>{l.type}</td>
                        <td>
                          <button className="btn ok" onClick={() => openLabModal(l.id)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing Modal */}
      {billingModalOpen && (
        <div className="modal-overlay" onClick={closeBillingModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{activeBilling ? "Edit Billing Code" : "Add Billing Code"}</h2>
              <button className="modal-close" onClick={closeBillingModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleBillingSave}>
                <div className="row">
                  <label htmlFor="billing-code">Code</label>
                  <input
                    type="text"
                    id="billing-code"
                    defaultValue={activeBilling?.code || ""}
                    placeholder="e.g., C-800"
                    required
                  />
                </div>
                <div className="row">
                  <label htmlFor="billing-desc">Description</label>
                  <input
                    type="text"
                    id="billing-desc"
                    defaultValue={activeBilling?.description || ""}
                    placeholder="e.g., Standard Consultation"
                    required
                  />
                </div>
                <div className="row">
                  <label htmlFor="billing-cost">Cost (₹)</label>
                  <input
                    type="number"
                    id="billing-cost"
                    defaultValue={activeBilling?.cost || ""}
                    required
                  />
                </div>
                <button type="submit" className="btn ok right">
                  Save Code
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lab Modal */}
      {labModalOpen && (
        <div className="modal-overlay" onClick={closeLabModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{activeLab ? "Edit Lab Test" : "Add Lab Test"}</h2>
              <button className="modal-close" onClick={closeLabModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleLabSave}>
                <div className="row">
                  <label htmlFor="lab-test-name">Test Name</label>
                  <input
                    type="text"
                    id="lab-test-name"
                    defaultValue={activeLab?.name || ""}
                    required
                  />
                </div>
                <div className="row">
                  <label htmlFor="lab-test-type">Type</label>
                  <select
                    id="lab-test-type"
                    defaultValue={activeLab?.type || "Lab"}
                    required
                  >
                    <option value="Lab">Lab</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>
                <button type="submit" className="btn ok right">
                  Save Test
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
