"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

export default function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [vaccineId, setVaccineId] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  const toggleModal = () => setModalOpen(!modalOpen);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [inventoryRes, vaccinesRes] = await Promise.all([
          fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/inventory"),
          fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/vaccines"),
        ]);

        if (!inventoryRes.ok) throw new Error("Failed to fetch inventory");
        if (!vaccinesRes.ok) throw new Error("Failed to fetch vaccines");

        setInventory(await inventoryRes.json());
        setVaccines(await vaccinesRes.json());
      } catch (err) {
        console.error(err);
        setError("Failed to load data from backend.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!vaccineId || !batchNumber || !expiryDate || !quantity) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaccineId, batchNumber, expiryDate, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to add stock.");
        return;
      }

      setInventory((prev) => [...prev, data]);
      toggleModal();
      setVaccineId("");
      setBatchNumber("");
      setExpiryDate("");
      setQuantity(1);
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  // Helper to render status badge
  const renderStatus = (qty) => {
    let statusClass = "status available";
    let statusText = "Available";
    if (qty === 0) {
      statusClass = "status out";
      statusText = "Out of Stock";
    } else if (qty < 20) {
      statusClass = "status low";
      statusText = "Low Stock";
    }
    return <span className={statusClass}>{statusText}</span>;
  };

  return (
    <>
      <Header />
      <main className="body">
        {/* Inventory Management Card */}
        <div className="card-container"
        style={{ maxWidth: "1580px", margin: "16px auto" }}
        >
          <div className="card-header">
            <h2>Vaccine Inventory Management</h2>
            <div className="right-controls">
              <input
                type="text"
                placeholder="🔍 Search by vaccine name or batch..."
                className="search-input"
              />
              <button className="add-btn" onClick={toggleModal}>
                ＋ Add New Stock
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <p className="loading-text">Loading inventory...</p>
            ) : error ? (
              <p className="error-text">{error}</p>
            ) : (
               <table className="table" className="table">
                <thead>
                  <tr>
                    <th>Vaccine</th>
                    <th>Batch Number</th>
                    <th>Expiry Date</th>
                    <th>Quantity Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">
                        No inventory found.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id}>
                        <td>{item.vaccine_name}</td>
                        <td>{item.batch_number}</td>
                        <td>
                          {new Date(item.expiry_date).toLocaleDateString()}
                        </td>
                        <td>{item.quantity}</td>
                        <td>{renderStatus(item.quantity)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

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

        {/* Add Stock Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2>Add New Vaccine Stock</h2>
                <button onClick={toggleModal} className="close-btn">
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddStock} className="modal-form">
                <div className="form-grid">
                  <div>
                    <label>Vaccine</label>
                    <select
                      value={vaccineId}
                      onChange={(e) => setVaccineId(e.target.value)}
                      required
                    >
                      <option value="">Select Vaccine</option>
                      {vaccines.map((v) => (
                        <option key={v.id} value={v.vaccine_id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Batch Number</label>
                    <input
                      type="text"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  Add to Inventory
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
