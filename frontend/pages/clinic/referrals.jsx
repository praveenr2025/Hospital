"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

export default function ReferralsPage() {
  const [newReferralModal, setNewReferralModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [referrals, setReferrals] = useState([]);

  const toggleNewReferralModal = () => setNewReferralModal(!newReferralModal);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, referralsRes] = await Promise.all([
          fetch("http://localhost:5000/api/clinic/patients"),
          fetch("http://localhost:5000/api/clinic/referrals"),
        ]);
        setPatients(await patientsRes.json());
        setReferrals(await referralsRes.json());
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    fetchData();
  }, []);

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    const patientId = document.getElementById("referral-patient-id").value;
    const direction = "Outbound";
    const provider = document.getElementById("referral-provider").value;
    const reason = document.getElementById("referral-reason").value;

    if (!patientId || !provider || !reason)
      return alert("Please fill all required fields.");

    try {
      const res = await fetch("http://localhost:5000/api/clinic/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, direction, provider, reason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create referral.");

      alert("Referral created successfully!");
      setNewReferralModal(false);
      setReferrals([data, ...referrals]);
    } catch (err) {
      console.error("Error creating referral:", err);
      alert(err.message);
    }
  };

  return (
    <>
      <Header />
       <main className="body">
        <div className="card referrals-card"
         style={{ maxWidth: "1580px", margin: "16px auto" }}>
          <div className="card-header">
            <h2>Referral Management</h2>
            <div className="actions">
              <input
                type="text"
                placeholder="🔍 Search by patient or provider..."
                className="search-box"
              />
              <button className="primary-btn" onClick={toggleNewReferralModal}>
                ＋ New Outbound Referral
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Direction</th>
                  <th>Provider</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.referral_date
                        ? new Date(r.referral_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>{r.patient_name}</td>
                    <td>{r.direction}</td>
                    <td>{r.provider}</td>
                    <td>{r.reason}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          r.status === "Completed"
                            ? "success"
                            : r.status === "Pending"
                            ? "pending"
                            : "neutral"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {newReferralModal && (
          <div className="modal-overlay">
            <div className="modal" >
              <div className="modal-header">
                <h2>New Outbound Referral</h2>
                <button className="close-btn" onClick={toggleNewReferralModal}>
                  &times;
                </button>
              </div>

              <form className="modal-body" onSubmit={handleReferralSubmit} >
                <label>
                  Patient
                  <select id="referral-patient-id" required>
                    <option value="">-- Select Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Refer To (Provider / Specialty)
                  <input
                    id="referral-provider"
                    type="text"
                    placeholder="e.g., Dr. Ashok Gupta (Cardiology)"
                    required
                  />
                </label>

                <label>
                  Reason for Referral
                  <textarea id="referral-reason" required></textarea>
                </label>

                <div className="modal-footer">
                  <button type="submit" className="primary-btn">
                    Send Referral
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
