"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

type Patient = {
  id: number;
  fullName: string;
  dob: string;
  gender: string;
  guardianPrimary: string;
  contactPrimary: string;
  guardianSecondary?: string;
  contactSecondary?: string;
  address?: string;
  bloodGroup?: string;
  allergies?: string;
  age: string;
};

type Vaccine = {
  id: number;
  name: string;
  vaccine_id: string;
  due_range?: string | null;
  status?: "Given" | "Pending" | "Out Of Stock" | null;
  date_given?: string | null;
};

type Milestone = {
  id: number;
  milestone_name: string;
  typical_age: string;
  status: string;
  achieved_date?: string | null;
};

type LabOrder = {
  id: number;
  test_name: string;
  test_type: string;
  order_date: string;
  status: string;
};

type Invoice = {
  id: number;
  invoice_date: string;
  total_amount: number;
  status: string;
};

type Growth = {
  id: number;
  date: string;
  weight: number;
  height: number;
  head_circumference?: number;
};

type Tab =
  | "fullhistory"
  | "consultations"
  | "vaccinations"
  | "milestones"
  | "labimaging"
  | "billing";

// ==================== Helper ====================
function calculateAge(dob: string) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months}m ${days}d`;
  return `${days}d`;
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ==================== Main Component ====================
export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("consultations");
  const [appointments, setAppointments] = useState<any[]>([]);

  const [consultations, setConsultations] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [growthRecords, setGrowthRecords] = useState<Growth[]>([]);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const toggleConsultationModal = () => setShowConsultationModal(!showConsultationModal);

  // ==================== Fetch Patients (Initial Load) ====================
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients");
        const data = await res.json();
        const normalized = data.map((p: any) => ({
          id: p.id,
          fullName: p.full_name,
          dob: p.dob,
          age: calculateAge(p.dob),
          gender: p.gender,
          guardianPrimary: p.guardian_primary,
          contactPrimary: p.contact_primary,
          guardianSecondary: p.guardian_secondary,
          contactSecondary: p.contact_secondary,
          address: p.address,
          bloodGroup: p.blood_group,
          allergies: p.allergies,
        }));
        setPatients(normalized);
      } catch (err) {
        setError("Failed to load patients");
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  // ==================== Fetch Selected Patient Data ====================
  // Combined the two identical useEffects into one
  useEffect(() => {
    if (!selectedPatient) return;

    (async () => {
      try {
        // Fetch all patient related data concurrently
        const [c, l, i, a, m, v, g] = await Promise.all([
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/consultations`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/lab-orders`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/invoices`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/appointments`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/milestones`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/vaccinations`),
          fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/growth`),
        ]);

        setConsultations(await c.json());
        setLabOrders(await l.json());
        setInvoices(await i.json());
        setAppointments(await a.json());
        setMilestones(await m.json());
        setVaccines(await v.json());
        setGrowthRecords(await g.json());
      } catch (err) {
        console.error("Error fetching patient data:", err);
      }
    })();
  }, [selectedPatient]);


  // ==================== JSX ====================
  return (
    <>
      <Header />
      <main className="body">
        {/* ================= ADD PATIENT MODAL ================= */}
          {modalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Register New Patient</h2>
                  <button
                    className="uni-modal-close"
                    onClick={() => setModalOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <div className="uni-modal-body">
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const data = Object.fromEntries(new FormData(form).entries());

                      if (!data.fullName || !data.dob || !data.guardianPrimary || !data.contactPrimary) {
                        alert("⚠️ Please fill all required fields.");
                        return;
                      }

                      try {
                        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(data),
                        });

                        const newPatient = await res.json();
                        if (res.ok) {
                          setPatients((prev) => [
                            ...prev,
                            {
                              id: newPatient.id,
                              fullName: newPatient.full_name,
                              dob: newPatient.dob,
                              age: calculateAge(newPatient.dob),
                              gender: newPatient.gender,
                              guardianPrimary: newPatient.guardian_primary,
                              contactPrimary: newPatient.contact_primary,
                              guardianSecondary: newPatient.guardian_secondary,
                              contactSecondary: newPatient.contact_secondary,
                              address: newPatient.address,
                              bloodGroup: newPatient.blood_group,
                              allergies: newPatient.allergies,
                            },
                          ]);
                          alert("✅ Patient added successfully!");
                          setModalOpen(false);
                          form.reset();
                        } else {
                          alert(newPatient.message || "❌ Failed to save patient.");
                        }
                      } catch (err) {
                        console.error("Error adding patient:", err);
                        alert("Server error while saving patient.");
                      }
                    }}
                  >
                    <section>
                      <h4>Patient Details</h4>
                      <div className="form-grid">
                        <input name="fullName" placeholder="Full Name" required />
                        <div className="form-grid">
                          <input name="dob" type="date" required />
                          <select name="gender" defaultValue="M" required>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                          </select>
                        </div>
                      </div>
                    </section>

                    <hr />

                    <section>
                      <h4>Guardian & Contact Details</h4>
                      <div className="form-grid">
                        <input name="guardianPrimary" placeholder="Primary Parent/Guardian Name" required />
                        <input name="contactPrimary" placeholder="Primary Contact Number" required />
                        <input name="guardianSecondary" placeholder="Secondary Parent/Guardian Name" />
                        <input name="contactSecondary" placeholder="Secondary Contact Number" />
                        <textarea name="address" placeholder="Address" rows={2} />
                      </div>
                    </section>

                    <hr />

                    <section>
                      <h4>Medical Information</h4>
                      <div className="form-grid">
                        <input name="bloodGroup" placeholder="e.g., O+" />
                        <input name="allergies" placeholder="Known Allergies" />
                      </div>
                    </section>

                    <div className="uni-modal-footer">
                      <button type="submit" className="btn-ok">
                        Save Patient Record
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

        {/* ==================== PATIENT DIRECTORY ==================== */}
        {!selectedPatient && (
          <div className="card" style={{ maxWidth: "1280px", margin: "12px auto" }}>
            <div
              className="flex-between"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <h2>Patient Directory</h2>
              <div style={{ margin: "12px 0", display: "flex", justifyContent: "flex-end" }}>
              <input
                type="text"
                placeholder="🔍 Search by name, guardian, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "8px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  width: "280px",
                  fontSize: "14px",
                  outline: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              />
            </div>
              <button className="btn ok" onClick={() => setModalOpen(true)}>
                ＋ Add New Patient
              </button>
            </div>

            {loading ? (
              <p>Loading patients...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
               <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Date of Birth</th>
                    <th>Primary Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {patients
                  .filter(
                    (p) =>
                      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.guardianPrimary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.contactPrimary.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((p) => (
                    <tr
                      key={p.id}
                      className="clickable"
                      onClick={() => setSelectedPatient(p)}
                    >
                                <td style={{ color: "#2563eb", fontWeight: 600 }}>{p.fullName}</td>
                                <td>{p.age}</td>
                                <td>{formatDate(p.dob)}</td>
                                <td>
                                  {p.guardianPrimary} ({p.contactPrimary})
                                </td>
                              </tr>
                            ))}
                  </tbody>
              </table>
                      )}
            </div>
                      )}

        {/* ==================== PATIENT DETAILS (COMBINED INTO MAIN COMPONENT) ==================== */}
        {selectedPatient && (
          <div className="page" style={{ maxWidth: "1280px", margin: "12px auto" }}>
            <button className="btn ghost" onClick={() => setSelectedPatient(null)}>
              ← Back to All Patients
            </button>

            <div className="grid">
              {/* LEFT PANEL */}
              <div className="cols-1">        
                <div className="card">
                  <h2>{selectedPatient.fullName}</h2>
                  <p>
                    DOB: {formatDate(selectedPatient.dob)} | Age: {selectedPatient.age}
                  </p>
                  <p>
                    <strong>Blood Group:</strong> {selectedPatient.bloodGroup || "—"}
                  </p>
                  <p>
                    <strong>Allergies:</strong> {selectedPatient.allergies || "None"}
                  </p>
                  <hr />
                  <h4>Contact Information</h4>
                  <p>
                    {selectedPatient.guardianPrimary} ({selectedPatient.contactPrimary})
                  </p>
                  {selectedPatient.guardianSecondary && (
                    <p>
                      {selectedPatient.guardianSecondary} ({selectedPatient.contactSecondary})
                    </p>
                  )}
                  <p>{selectedPatient.address}</p>
                </div>

                <div className="card" style={{ marginTop: "16px" }}>
                  <h4>Growth Chart</h4>

                  {/* --- Table --- */}
                    <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Wt (kg)</th>
                        <th>Ht (cm)</th>
                        <th>HC (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {growthRecords.length > 0 ? (
                        growthRecords.map((g) => (
                          <tr key={g.id}>
                            <td>{formatDate(g.date)}</td>
                            <td>{g.weight}</td>
                            <td>{g.height}</td>
                            <td>{g.head_circumference || "—"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ textAlign: "center" }}>
                            No records yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div style={{ textAlign: "right", marginTop: "12px" }}>
                    <button className="btn ok small" onClick={() => setShowGrowthModal(true)}>
                      ＋ Add Growth Record
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL */}
              <div className="cols-2">
                <div className="card">
                  <div className="tabs">
                    {["fullhistory", "consultations", "vaccinations", "milestones", "labimaging", "billing"].map(
                      (t) => (
                        <div
                          key={t}
                          className={`tab ${activeTab === t ? "active" : ""}`}
                          onClick={() => setActiveTab(t as Tab)}
                        >
                          {t === "fullhistory"
                            ? "Full History"
                            : t.charAt(0).toUpperCase() + t.slice(1)}
                        </div>
                      )
                    )}
                  </div>

                  {/* ==================== FULL HISTORY TAB ==================== */}
                  {activeTab === "fullhistory" && (
                    <div>
                      <h3>Patient 360° Timeline</h3>

                      <div
                        className="timeline"
                        style={{
                          marginTop: "20px",
                          position: "relative",
                          paddingLeft: "32px",
                        }}
                      >
                        {/* Vertical timeline line */}
                        <div
                          style={{
                            position: "absolute",
                            left: "15px",
                            top: "0",
                            bottom: "0",
                            width: "2px",
                            backgroundColor: "#e2e8f0",
                          }}
                        ></div>

                        {[
                          ...consultations.map((item) => ({
                            type: "Consultation",
                            date: item.consultation_date,
                            title: `Consultation: ${item.diagnosis || "General Checkup"}`,
                            desc: `Symptoms: ${item.symptoms || "—"} | Plan: ${item.treatment_plan || "—"}`,
                            icon: "🩺",
                            color: "#0ea5e9",
                          })),

                          ...labOrders
                            .filter((item) => !!item.id)
                            .map((item) => ({
                              type: "Lab",
                              date: item.order_date,
                              title: `Lab Ordered: ${item.test_name}`,
                              desc: `Type: ${item.test_type} | Status: ${item.status || "Pending"}`,
                              icon: "🧪",
                              color: "#7c3aed",
                            })),

                          ...invoices
                            .filter((item) => !!item.id)
                            .map((item) => ({
                              type: "Invoice",
                              date: item.invoice_date,
                              title: `Invoice #${item.id} Generated: ₹ ${item.total_amount}`,
                              desc: `Status: ${item.status || "Pending"}`,
                              icon: "💰",
                              color: "#f59e0b",
                            })),

                          ...appointments
                            .filter((item) => !!item.id)
                            .map((item) => ({
                              type: "Appointment",
                              date: item.appointment_date || item.date,
                              title: `Appointment: ${item.reason || "Follow-up"}`,
                              desc: `Doctor: ${item.doctor_name || "—"} | Status: ${
                                item.status || "Scheduled"
                              }`,
                              icon: "📅",
                              color: "#22c55e",
                            })),
                        ]
                          // ✅ Only show entries that actually exist
                          .filter((entry) => entry.date)
                          // ✅ Sort by date descending
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((entry, index) => (
                            <div
                              key={index}
                              style={{
                                position: "relative",
                                marginBottom: "20px",
                                paddingLeft: "16px",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  left: "-28px",
                                  top: "8px",
                                  width: "36px",
                                  height: "36px",
                                  background: entry.color,
                                  color: "white",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "18px",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                }}
                              >
                                {entry.icon}
                              </div>

                              <div
                                style={{
                                  background: "white",
                                  borderRadius: "12px",
                                  padding: "16px",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                                  border: "1px solid #f1f5f9",
                                }}
                              >
                                <h4 style={{ margin: 0, color: "#111827" }}>{entry.title}</h4>
                                <p style={{ margin: "4px 0", color: "#64748b", fontSize: "14px" }}>
                                  {formatDate(entry.date)}
                                </p>
                                <p style={{ margin: 0, color: "#334155", fontSize: "14px" }}>
                                  {entry.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* ================= CONSULTATIONS ================= */}
                  {activeTab === "consultations" && (
                    <div>
                      <div className="flex-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3>Consultation History</h3>
                        <button className="btn ok" onClick={toggleConsultationModal}>
                          ＋ New Consultation
                        </button>
                      </div>

                      {consultations.length > 0 ? (
                        consultations
                          .slice()
                          .reverse()
                          .map((c) => (
                            <div
                              key={c.id}
                              className="card"
                              style={{
                                marginTop: "16px",
                                padding: "16px",
                                background: "#fff",
                                borderRadius: "12px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                              }}
                            >
                              <p style={{ fontWeight: 600, color: "#1e293b" }}>
                                Visit on {new Date(c.consultation_date).toLocaleDateString("en-GB")}
                              </p>
                              <p style={{ marginTop: "6px", fontSize: "14px", color: "#334155" }}>
                                <strong>Temp:</strong> {c.temperature || "—"}°F &nbsp; | &nbsp;
                                <strong>HR:</strong> {c.heart_rate || "—"} bpm &nbsp; | &nbsp;
                                <strong>RR:</strong> {c.resp_rate || "—"} bpm
                              </p>
                              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                                <strong>Doctor:</strong> {c.doctor_name || "—"}
                              </p>
                              <p style={{ marginTop: "8px", fontSize: "14px" }}>
                                <strong>Symptoms:</strong> {c.symptoms || "—"}
                              </p>
                              <p style={{ marginTop: "4px", fontSize: "14px" }}>
                                <strong>Diagnosis:</strong> {c.diagnosis || "—"}
                              </p>
                              <p style={{ marginTop: "4px", fontSize: "14px" }}>
                                <strong>Plan:</strong> {c.treatment_plan || "—"}
                              </p>
                            </div>
                          ))
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            marginTop: "16px",
                            padding: "24px",
                            background: "#f8fafc",
                            borderRadius: "8px",
                            color: "#64748b",
                          }}
                        >
                          No consultations yet
                        </div>
                      )}
                    </div>
                  )}

                  {/* ================= ADD GROWTH MODAL ================= */}
                  {showGrowthModal && (
                    <div className="uni-modal-overlay">
                      <div className="uni-modal-content" style={{ maxWidth: "540px" }}>
                        <div className="uni-modal-header">
                          <h2>Add Growth Record</h2>
                          <button className="uni-modal-close" onClick={() => setShowGrowthModal(false)}>
                            &times;
                          </button>
                        </div>

                        <div className="uni-modal-body">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

                              try {
                                const res = await fetch(
                                  `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient?.id}/growth`,
                                  {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      date: data.date,
                                      weight: parseFloat(data.weight),
                                      height: parseFloat(data.height),
                                      headCircumference: data.headCircumference
                                        ? parseFloat(data.headCircumference)
                                        : null,
                                    }),
                                  }
                                );

                                if (res.ok) {
                                  const newRecord = await res.json();
                                  setGrowthRecords((prev) => [...prev, newRecord]);
                                  alert("✅ Growth record added!");
                                  form.reset();
                                  setShowGrowthModal(false);
                                } else {
                                  alert("❌ Failed to save growth record.");
                                }
                              } catch (err) {
                                console.error("Error adding growth record:", err);
                                alert("Server error while adding growth record.");
                              }
                            }}
                          >
                            <div className="form-grid" style={{ display: "grid", gap: "8px" }}>
                              <input name="date" type="date" required />
                              <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" required />
                              <input name="height" type="number" step="0.1" placeholder="Height (cm)" required />
                              <input
                                name="headCircumference"
                                type="number"
                                step="0.1"
                                placeholder="Head Circ. (cm)"
                              />
                            </div>

                            <button className="btn-ok" style={{ marginTop: "12px", width: "100%" }}>
                              💾 Save Record
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ================= ADD VACCINATION MODAL ================= */}
                  {showVaccineModal && (
                    <div className="uni-modal-overlay">
                      <div className="uni-modal-content" style={{ maxWidth: "540px" }}>
                        <div className="uni-modal-header">
                          <h2>Add Vaccination</h2>
                          <button className="uni-modal-close" onClick={() => setShowVaccineModal(false)}>
                            &times;
                          </button>
                        </div>

                        <div className="uni-modal-body">
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const form = e.currentTarget;
                              const data = Object.fromEntries(new FormData(form).entries());

                              const res = await fetch(
                                `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient?.id}/vaccinations`,
                                {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    vaccineId: data.vaccineId,
                                    dateGiven: data.dateGiven,
                                  }),
                                }
                              );

                              if (res.ok) {
                                const newRecord = await res.json();
                                setVaccines((prev) =>
                                  prev.map((v) =>
                                    v.id === Number(data.vaccineId)
                                      ? { ...v, status: "Given", date_given: newRecord.date_given }
                                      : v
                                  )
                                );
                                alert("✅ Vaccination added successfully!");
                                form.reset();
                                setShowVaccineModal(false);
                              } else {
                                alert("❌ Failed to save vaccination record.");
                              }
                            }}
                          >
                            <select name="vaccineId" required style={{ width: "100%", marginBottom: "8px" }}>
                              <option value="">Select Vaccine</option>
                              {vaccines
                                .filter((v) => v.status !== "Given")
                                .map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name} ({v.due_range || "N/A"})
                                  </option>
                                ))}
                            </select>

                            <input name="dateGiven" type="date" required style={{ width: "100%" }} />

                            <button className="btn-ok" style={{ marginTop: "12px", width: "100%" }}>
                              💾 Save Vaccination
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== ADD CONSULTATION MODAL ==================== */}
                  {showConsultationModal && (
                    <div className="uni-modal-overlay">
                      <div className="uni-modal-content" style={{ maxWidth: "640px" }}>
                        <div className="uni-modal-header">
                          <h2>New Consultation Note</h2>
                          <button className="uni-modal-close" onClick={toggleConsultationModal}>
                            &times;
                          </button>
                        </div>

                        <div className="uni-modal-body">
                          <p>
                            For: <strong>{selectedPatient?.fullName}</strong> | Date:{" "}
                            {new Date().toLocaleDateString("en-GB")}
                          </p>

                          <ConsultationForm
                            patientId={selectedPatient?.id}
                            onClose={toggleConsultationModal}
                            onNewConsultation={(newConsultation: any) =>
                              setConsultations((prev) => [...prev, newConsultation])
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== VACCINATIONS TAB ==================== */}
                  {activeTab === "vaccinations" && (
                    <div>
                      {/* --- Header --- */}
                      <div
                        className="flex-between"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h3>Vaccination Status</h3>

                        <div style={{ display: "flex", gap: "8px" }}>


                          <button
                            className="btn ok"
                            onClick={() => setShowVaccineModal(true)}
                          >
                            ＋ Add Vaccination
                          </button>
                        </div>
                      </div>

                      {/* --- Vaccination Table --- */}
                       <table className="table"  style={{ marginTop: "12px" }}>
                        <thead>
                          <tr>
                            <th>Vaccine</th>
                            <th>Due Range</th>
                            <th>Status</th>
                            <th>Date Given</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaccines.length > 0 ? (
                            vaccines.map((v) => (
                              <tr key={v.id}>
                                <td>{v.name}</td>
                                <td>{v.due_range || "—"}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                        v.status === "Given"
                                          ? "green"
                                          : v.status === "Out Of Stock"
                                            ? "gray"
                                            : "yellow"
                                      }`}
                                  >
                                    {v.status || "Pending"}
                                  </span>
                                </td>
                                <td>{v.date_given ? formatDate(v.date_given) : "—"}</td>
                                <td>
                                  {v.status === "Given" ? (
                                    "—"
                                  ) : v.status === "Out Of Stock" ? (
                                    <button disabled className="btn ghost small">
                                      Out of Stock
                                    </button>
                                  ) : (
                                    <button
                                      className="btn ok small"
                                      onClick={async () => {
                                        const dateGiven = prompt(
                                          `Enter date for ${v.name} (YYYY-MM-DD):`
                                        );
                                        if (!dateGiven) return;

                                        try {
                                          const res = await fetch(
                                            `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/vaccinations`,
                                            {
                                              method: "POST",
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                vaccineId: v.id,
                                                dateGiven,
                                              }),
                                            }
                                          );

                                          if (res.ok) {
                                            const updated = await res.json();
                                            setVaccines((prev) =>
                                              prev.map((item) =>
                                                item.id === v.id
                                                  ? {
                                                      ...item,
                                                      status: "Given",
                                                      date_given: updated.date_given,
                                                    }
                                                  : item
                                              )
                                            );
                                            alert("✅ Vaccine marked as given!");
                                          } else {
                                            alert("❌ Failed to update vaccination record.");
                                          }
                                        } catch (err) {
                                          console.error("Error updating vaccination:", err);
                                          alert("Server error while updating vaccination.");
                                        }
                                      }}
                                    >
                                      Mark as Given
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "#64748b" }}>
                                No vaccination data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                    </div>
                  )}


                  {/* =========Milestones========================= */}
                  {activeTab === "milestones" && (
                    <div>
                      <div className="flex-between" style={{ display: "flex", justifyContent: "space-between" }}>
                        <h3>Developmental Milestones</h3>
                        <div style={{ textAlign: "right", marginTop: "12px" }}>
                          <button
                            className="btn ok"
                            onClick={() => setShowMilestoneModal(true)}
                          >
                            ＋ Add New Milestone
                          </button>
                        </div>
                      </div>

                       <table className="table"  style={{ marginTop: "12px" }}>
                        <thead>
                          <tr>
                            <th>Milestone</th>
                            <th>Typical Age</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {milestones.length > 0 ? (
                            milestones.map((m) => (
                              <tr key={m.id}>
                                <td style={{ fontWeight: "600" }}>{m.milestone_name}</td>
                                <td>{m.typical_age || "—"}</td>
                                <td>
                                  {m.status === "Achieved" ? (
                                    <span style={{ color: "green", fontWeight: 500 }}>
                                      ✅ Achieved on{" "}
                                      {m.achieved_date
                                        ? new Date(m.achieved_date).toLocaleDateString("en-GB")
                                        : "—"}
                                    </span>
                                  ) : (
                                    <span style={{ color: "#6b7280" }}>Pending</span>
                                  )}
                                </td>
                                <td>
                                  {m.status === "Achieved" ? (
                                    "—"
                                  ) : (
                                    <button
                                      className="btn ok small"
                                      onClick={async () => {
                                        const dateAchieved = prompt(
                                          `Enter date achieved for "${m.milestone_name}" (YYYY-MM-DD):`
                                        );
                                        if (!dateAchieved) return;

                                        try {
                                          const res = await fetch(
                                            `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/milestones`,
                                            {
                                              method: "POST", // ✅ Correct method
                                              headers: { "Content-Type": "application/json" },
                                              body: JSON.stringify({
                                                milestoneId: m.id,
                                                dateAchieved,
                                              }),
                                            }
                                          );

                                          if (res.ok) {
                                            const updated = await res.json();
                                            setMilestones((prev) =>
                                              prev.map((item) =>
                                                item.id === m.id
                                                  ? {
                                                      ...item,
                                                      status: "Achieved",
                                                      achieved_date: updated.achieved_date,
                                                    }
                                                  : item
                                              )
                                            );
                                            alert("✅ Milestone marked as achieved!");
                                          } else {
                                            alert("❌ Failed to update milestone status.");
                                          }
                                        } catch (err) {
                                          console.error("Error updating milestone:", err);
                                          alert("Server error while updating milestone.");
                                        }
                                      }}
                                    >
                                      Mark as Achieved
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ textAlign: "center", color: "#6b7280" }}>
                                No milestones yet
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* ================= ADD MILESTONE MODAL ================= */}
                      {showMilestoneModal && (
                        <div className="uni-modal-overlay">
                          <div className="uni-modal-content" style={{ maxWidth: "540px" }}>
                            <div className="uni-modal-header">
                              <h2>Add New Milestone</h2>
                              <button className="uni-modal-close" onClick={() => setShowMilestoneModal(false)}>
                                &times;
                              </button>
                            </div>

                            <div className="uni-modal-body">
                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  const form = e.currentTarget;
                                  const data = Object.fromEntries(new FormData(form).entries());

                                  try {
                                    const res = await fetch(
                                      `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/patients/${selectedPatient.id}/addMilestone`,
                                      {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          milestone_name: data.milestone_name,
                                          typical_age: data.typical_age,
                                        }),
                                      }
                                    );

                                    if (res.ok) {
                                      const newMilestone = await res.json();
                                      setMilestones((prev) => [...prev, newMilestone]);
                                      form.reset();
                                      alert("✅ Milestone added successfully!");
                                      setShowMilestoneModal(false);
                                    } else {
                                      alert("❌ Failed to add milestone.");
                                    }
                                  } catch (err) {
                                    console.error("Error adding milestone:", err);
                                    alert("Server error while adding milestone.");
                                  }
                                }}
                              >
                                <div className="form-grid" style={{ display: "grid", gap: "8px" }}>
                                  <input
                                    name="milestone_name"
                                    type="text"
                                    placeholder="Milestone Name (e.g., Sits Alone)"
                                    required
                                  />
                                  <select name="typical_age" required>
                                    <option value="">Select Typical Age</option>
                                    <option value="6-8 Weeks">6–8 Weeks</option>
                                    <option value="2-3 Months">2–3 Months</option>
                                    <option value="4-6 Months">4–6 Months</option>
                                    <option value="6-8 Months">6–8 Months</option>
                                    <option value="8-10 Months">8–10 Months</option>
                                    <option value="10-12 Months">10–12 Months</option>
                                    <option value="11-14 Months">11–14 Months</option>
                                    <option value="12-16 Months">12–16 Months</option>
                                  </select>
                                </div>

                                <button className="btn-ok" style={{ marginTop: "12px", width: "100%" }}>
                                  💾 Save Milestone
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== LAB & IMAGING TAB ==================== */}
                  {activeTab === "labimaging" && (
                    <div>
                      <h3>Lab & Imaging History</h3>

                       <table className="table"  style={{ marginTop: "12px" }}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Test/Scan</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {labOrders.length > 0 ? (
                            labOrders.map((lab) => (
                              <tr key={lab.id}>
                                <td>{formatDate(lab.order_date)}</td>
                                <td style={{ fontWeight: 500 }}>{lab.test_name}</td>
                                <td>
                                  <span
                                    style={{
                                      background:
                                        lab.test_type === "Imaging" ? "#e0f2fe" : "#ede9fe",
                                      color:
                                        lab.test_type === "Imaging" ? "#0284c7" : "#7c3aed",
                                      padding: "4px 10px",
                                      borderRadius: "999px",
                                      fontSize: "13px",
                                    }}
                                  >
                                    {lab.test_type}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                        lab.status === "Completed"
                                          ? "green"
                                          : lab.status === "In Progress"
                                            ? "yellow"
                                            : "gray"
                                      }`}
                                  >
                                    {lab.status}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn-ghost"
                                    style={{
                                      fontSize: "13px",
                                      color: "#2563eb",
                                      background: "#f1f5f9",
                                      border: "1px solid #e2e8f0",
                                      padding: "4px 10px",
                                      borderRadius: "8px",
                                    }}
                                    onClick={() => alert(
                                      `🧪 Test Details:\n\nTest: ${lab.test_name}\nType: ${lab.test_type}\nStatus: ${lab.status}\nDate: ${formatDate(lab.order_date)}`
                                    )}
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "#6b7280" }}>
                                No Lab or Imaging Records
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ==================== BILLING TAB ==================== */}
                  {activeTab === "billing" && (
                    <div>
                      <h3>Billing History</h3>

                       <table className="table"  style={{ marginTop: "12px" }}>
                        <thead>
                          <tr>
                            <th>Invoice ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.length > 0 ? (
                            invoices.map((inv) => (
                              <tr key={inv.id}>
                                <td>#{inv.id}</td>
                                <td>{formatDate(inv.invoice_date)}</td>
                                <td>₹ {inv.total_amount}</td>
                                <td>
                                  <span
                                    className={`badge ${
                                        inv.status === "Paid" ? "green" : "yellow"
                                        }`}
                                  >
                                    {inv.status}
                                  </span>
                                </td>
                                <td style={{ display: "flex", gap: "6px" }}>
                                  {/* View Button */}
                                  <button
                                    className="btn-ghost"
                                    style={{
                                      fontSize: "13px",
                                      color: "#2563eb",
                                      background: "#f1f5f9",
                                      border: "1px solid #e2e8f0",
                                      padding: "4px 10px",
                                      borderRadius: "8px",
                                    }}
                                    onClick={() =>
                                      alert(
                                        `💰 Invoice Details:\n\nInvoice ID: #${inv.id}\nDate: ${formatDate(inv.invoice_date)}\nAmount: ₹${inv.total_amount}\nStatus: ${inv.status}`
                                      )
                                    }
                                  >
                                    View
                                  </button>

                                  {/* Mark Paid Button */}
                                  {inv.status !== "Paid" && (
                                    <button
                                      className="btn-ok small"
                                      onClick={async () => {
                                        const confirmPay = confirm(
                                          `Mark Invoice #${inv.id} as Paid?`
                                        );
                                        if (!confirmPay) return;

                                        const res = await fetch(
                                          `https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/invoices/${inv.id}`,
                                          {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ status: "Paid" }),
                                          }
                                        );
                                        if (res.ok) {
                                          setInvoices((prev) =>
                                            prev.map((i) =>
                                              i.id === inv.id ? { ...i, status: "Paid" } : i
                                            )
                                          );
                                          alert("✅ Invoice marked as Paid!");
                                        } else {
                                          alert("❌ Failed to update invoice status.");
                                        }
                                      }}
                                    >
                                      Mark as Paid
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} style={{ textAlign: "center", color: "#6b7280" }}>
                                No invoices found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}
      </main>

    </>
  );
}

/* ==================== CONSULTATION FORM COMPONENT ==================== */
function ConsultationForm({
  patientId,
  onClose,
  onNewConsultation,
}: {
  patientId: number | undefined;
  onClose: () => void;
  onNewConsultation: (consultation: any) => void;
}) {
  const [doctors, setDoctors] = React.useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Fetch doctors
  React.useEffect(() => {
    const loadDoctors = async () => {
      try {
        const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/doctors");
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId: Number(data.doctorId),
          temperature: data.temperature || null,
          heartRate: data.heartRate || null,
          respRate: data.respRate || null,
          symptoms: data.symptoms || "",
          diagnosis: data.diagnosis || "",
          treatmentPlan: data.treatmentPlan || "",
          prescription: data.prescription || "",
        }),
      });

      if (res.ok) {
        const newConsultation = await res.json();
        onNewConsultation(newConsultation);
        form.reset();
        onClose();
      } else {
        const errMsg = await res.json();
        alert(errMsg.message || "Failed to save consultation.");
      }
    } catch (err) {
      console.error("Error saving consultation:", err);
      alert("Error saving consultation.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Doctor</h4>
      {loading ? (
        <p>Loading doctors...</p>
      ) : (
        <select
          name="doctorId"
          required
          style={{ width: "100%", marginBottom: "12px" }}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>
              Dr. {doc.name}
            </option>
          ))}
        </select>
      )}

      <h4>Vitals</h4>
      <div className="form-grid">
        <input name="temperature" placeholder="Temperature (°F)" type="number" />
        <input name="heartRate" placeholder="Heart Rate (bpm)" type="number" />
        <input name="respRate" placeholder="Resp. Rate (bpm)" type="number" />
      </div>

      <h4 style={{ marginTop: "16px" }}>Notes</h4>
      <textarea
        name="symptoms"
        placeholder="Symptoms / Observations"
        rows={2}
        style={{ width: "100%", resize: "none" }}
      ></textarea>

      <input
        name="diagnosis"
        placeholder="Diagnosis"
        style={{ width: "100%", marginTop: "8px" }}
      />

      <textarea
        name="treatmentPlan"
        placeholder="Treatment Plan"
        rows={2}
        style={{ width: "100%", marginTop: "8px", resize: "none" }}
      ></textarea>

      <textarea
        name="prescription"
        placeholder="Prescription"
        rows={2}
        style={{ width: "100%", marginTop: "8px", resize: "none" }}
      ></textarea>

      <div className="uni-modal-footer">
        <button type="submit" className="btn-ok">
          💾 Save Consultation
        </button>
      </div>
    </form>
  );
}
