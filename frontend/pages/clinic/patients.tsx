"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";

// TypeScript types
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
  nextAppointment?: string;
  // Added age for the new column from the screenshot
  age: string;
};

// Helper function to calculate age
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

  if (years > 0) {
    return `${years}y ${months}m`;
  } else if (months > 0) {
    return `${months}m ${days}d`;
  } else {
    return `${days}d`;
  }
}

export default function PatientsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form States
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("M");
  const [guardianPrimary, setGuardianPrimary] = useState("");
  const [contactPrimary, setContactPrimary] = useState("");
  const [guardianSecondary, setGuardianSecondary] = useState("");
  const [contactSecondary, setContactSecondary] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");

  const toggleModal = () => setModalOpen(!modalOpen);

  // Fetch patients on load
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/api/clinic/patients");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        // Normalize data from snake_case to camelCase
        const normalizedPatients: Patient[] = data.map((p: any) => ({
          id: p.id,
          fullName: p.full_name,
          // Store DOB as YYYY-MM-DD for consistency
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
          // Format next appointment time
          nextAppointment: p.next_appointment
            ? new Date(p.next_appointment).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "None scheduled",
        }));
        setPatients(normalizedPatients);
      } catch (err: any) {
        setError("Failed to load patients from backend.");
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  // Handle form submit
  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !dob || !gender || !guardianPrimary || !contactPrimary) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/clinic/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          dob,
          gender,
          guardianPrimary,
          contactPrimary,
          guardianSecondary,
          contactSecondary,
          address,
          bloodGroup,
          allergies,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const newPatient: Patient = {
          id: data.id,
          fullName: data.full_name,
          dob: data.dob,
          age: calculateAge(data.dob),
          gender: data.gender,
          guardianPrimary: data.guardian_primary,
          contactPrimary: data.contact_primary,
          guardianSecondary: data.guardian_secondary,
          contactSecondary: data.contact_secondary,
          address: data.address,
          bloodGroup: data.blood_group,
          allergies: data.allergies,
          nextAppointment: "None scheduled", // New patient won't have one yet
        };
        setPatients((prev) => [...prev, newPatient]);
        toggleModal();
        // Reset form
        setFullName("");
        setDob("");
        setGender("M");
        setGuardianPrimary("");
        setContactPrimary("");
        setGuardianSecondary("");
        setContactSecondary("");
        setAddress("");
        setBloodGroup("");
        setAllergies("");
      } else {
        alert(data.message || "Failed to add patient.");
      }
    } catch (err) {
      alert("Server error. Try again.");
    }
  };

  // Helper to format Date of Birth for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />
      {/* Use .body class for main content area */}
      <main className="body">
        {/* Patients Directory Card */}
        {/* Use .card class, add inline styles for max-width and margin */}
        <div
          className="card"
          style={{ maxWidth: "1580px", margin: "16px auto" }}
        >
          {/* Use .row class, add inline style for alignment and margin */}
          <div
            className="row"
            style={{ alignItems: "center", marginBottom: "16px" }}
          >
            <h2 style={{ margin: 0 }}>Patient Directory</h2>
            {/* Use default <input> styling, add inline style for max-width */}
            <input
              type="text"
              placeholder="🔍 Search by name, parent, or contact..."
              style={{ maxWidth: "350px", marginLeft: "16px" }}
              // TODO: add search logic
            />
            {/* Use .btn, .ok, and .right classes */}
            <button
              type="button"
              onClick={toggleModal}
              className="btn ok right"
            >
              ＋ Add New Patient
            </button>
          </div>

          {/* Use inline style for overflow */}
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p>Loading patients...</p>
            ) : error ? (
              // Use inline style for error color
              <p style={{ color: "var(--bad)" }}>{error}</p>
            ) : (
              // Use default <table> styling
              <table>
                {/* Use default <thead> styling */}
                <thead>
                  <tr>
                    {/* Add all columns from screenshot */}
                    <th>Name</th>
                    <th>Age</th>
                    <th>Date of Birth</th>
                    <th>Primary Contact</th>
                    <th>Next Appointment</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      {/* Use inline style for text alignment */}
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No patients found.
                      </td>
                    </tr>
                  ) : (
                    patients.map((p) => (
                      <tr key={p.id} className="clickable">
                        {/* Use default <td> styling */}
                        <td>{p.fullName}</td>
                        <td>{p.age}</td>
                        <td>{formatDate(p.dob)}</td>
                        <td>
                          {p.guardianPrimary} ({p.contactPrimary})
                        </td>
                        <td>{p.nextAppointment}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Pagination Controls */}
            {/* Use .inline class for flex, add inline style for margin */}
            <div className="inline" style={{ marginTop: "12px" }}>
              {/* Use .tab class for pagination button styling */}
              <button className="tab">Previous</button>
              <span style={{ padding: "0 12px", fontSize: "14px" }}>
                Page 1
              </span>
              <button className="tab">Next</button>
              {/* Use default <select> styling */}
              <select defaultValue="10" style={{ marginLeft: "8px" }}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Patient Modal */}
        {modalOpen && (
          // Use .modal-overlay
          <div className="modal-overlay">
            {/* Use .modal-content, add inline style for max-width */}
            <div className="modal-content" style={{ maxWidth: "512px" }}>
              {/* Use .modal-header */}
              <div className="modal-header">
                <h2>Register New Patient</h2>
                {/* Use .modal-close */}
                <button
                  onClick={toggleModal}
                  className="modal-close"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Use .modal-body for scrolling */}
              <div className="modal-body">
                <form onSubmit={handleSavePatient}>
                  {/* Each form section is wrapped in .row for margin */}
                  <div className="row">
                    <h4>Patient Details</h4>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div className="row">
                    {/* Use .form-grid for 2-column layout */}
                    <div className="form-grid">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                        style={{ width: "100%" }}
                      />
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        required
                        style={{ width: "100%" }}
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <h4>Guardian & Contact Details</h4>
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Primary Parent/Guardian Name"
                        value={guardianPrimary}
                        onChange={(e) => setGuardianPrimary(e.target.value)}
                        required
                        style={{ width: "100%" }}
                      />
                      <input
                        type="tel"
                        placeholder="Primary Contact Number"
                        value={contactPrimary}
                        onChange={(e) => setContactPrimary(e.target.value)}
                        required
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Secondary Parent/Guardian Name"
                        value={guardianSecondary}
                        onChange={(e) => setGuardianSecondary(e.target.value)}
                        style={{ width: "100%" }}
                      />
                      <input
                        type="tel"
                        placeholder="Secondary Contact Number"
                        value={contactSecondary}
                        onChange={(e) => setContactSecondary(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <textarea
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      // Use inline style for width and resize
                      style={{ width: "100%", resize: "none" }}
                    />
                  </div>

                  <div className="row">
                    <h4>Medical Information</h4>
                    <input
                      type="text"
                      placeholder="Blood Group (e.g., O+)"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>

                  <div className="row">
                    <input
                      type="text"
                      placeholder="Known Allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </div>

                  {/* Submit Button */}
                  {/* Use inline style for alignment and padding */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "8px",
                    }}
                  >
                    {/* Use .btn and .ok classes */}
                    <button type="submit" className="btn ok">
                      Save Patient Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}