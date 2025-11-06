"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

export default function BillingPage() {
  const [patients, setPatients] = useState([]);
  const [billingCodes, setBillingCodes] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([{ codeId: null, desc: "", cost: 0 }]);
  const [modalOpen, setModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);

  // Toggle modal
  const toggleModal = () => setModalOpen(!modalOpen);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients");
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  // Fetch billing codes
  useEffect(() => {
    const fetchBillingCodes = async () => {
      try {
        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/billing");
        const data = await res.json();
        setBillingCodes(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBillingCodes();
  }, []);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/invoices");
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInvoices();
  }, []);

  // Add new invoice item
  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { codeId: null, desc: "", cost: 0 }]);
  };

  // Handle select billing code
  const handleBillingSelect = (index, codeId) => {
    const selected = billingCodes.find((b) => b.id == codeId);
    const items = [...invoiceItems];
    items[index] = {
      codeId,
      desc: selected?.description || "",
      cost: selected?.cost || 0
    };
    setInvoiceItems(items);
  };

  // Handle manual item change
  const handleItemChange = (index, field, value) => {
    const items = [...invoiceItems];
    items[index][field] = value;
    setInvoiceItems(items);
  };

  // Handle invoice submission
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    const patientId = document.getElementById("invoice-patient-id").value;
    const invoiceDate = document.getElementById("invoice-date").value;
    const status = document.getElementById("invoice-status").value;

    if (!patientId || !invoiceDate || invoiceItems.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, invoiceDate, items: invoiceItems, status })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create invoice.");
        return;
      }

      alert("Invoice created successfully!");
      setModalOpen(false);
      setInvoiceItems([{ codeId: null, desc: "", cost: 0 }]);
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  return (
    <>
      <Header />
    <main className="body">
        <div className="card" style={{ maxWidth: "1580px", margin: "16px auto" }}>
          <div className="row" style={{ maxWidth: "1880px", margin: "16px auto" }}>
            <h2>Billing & Invoicing</h2>
            <input
              type="text"
              placeholder="🔍 Search by patient name or invoice ID..."
              className="right"
              style={{ maxWidth: "250px" }}
            />
            <button className="btn ok right" onClick={toggleModal}>
              ＋ Create New Invoice
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="muted" style={{ textAlign: "center" }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{inv.id}</td>
                      <td>{inv.patient_name}</td>
                      <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td>₹{Number(inv.total_amount).toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${inv.status.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn ghost">Edit</button>
                        <button className="btn bad" style={{ marginLeft: "8px" }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <>
            <div className="modal-overlay" onClick={toggleModal}></div>
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create New Invoice</h2>
                <button className="modal-close" onClick={toggleModal}>
                  &times;
                </button>
              </div>

              <form onSubmit={handleInvoiceSubmit}>
                <div className="form-grid">
                  <div>
                    <label htmlFor="invoice-patient-id">Patient</label>
                    <select id="invoice-patient-id" required>
                      <option value="">Select Patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="invoice-date">Invoice Date</label>
                    <input type="date" id="invoice-date" required />
                  </div>
                </div>

                <hr />

                <h4>Invoice Items</h4>
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="form-grid cols-3">
                    <select
                      value={item.codeId || ""}
                      onChange={(e) => handleBillingSelect(idx, e.target.value)}
                      required
                      className="full-width"
                    >
                      <option value="">Select Billing Code</option>
                      {billingCodes.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.code} - {b.description} (₹{b.cost})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Cost (₹)"
                      value={item.cost}
                      onChange={(e) => handleItemChange(idx, "cost", e.target.value)}
                      required
                    />
                  </div>
                ))}

                <button type="button" className="btn ghost" onClick={addInvoiceItem}>
                  ＋ Add Item
                </button>

                <hr />

                <div>
                  <label htmlFor="invoice-status">Status</label>
                  <select id="invoice-status">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div style={{ textAlign: "right", marginTop: "16px" }}>
                  <button type="submit" className="btn ok">
                    Save Invoice
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </>
  );
}
