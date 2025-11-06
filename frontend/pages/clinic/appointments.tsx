"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/clinic/Header";
import { fetchAPI } from "../api/api";


type Appointment = {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  reason: string;
  status: string;
};

type Patient = {
  id: number;
  full_name: string;
};

type Doctor = {
  id: number;
  name: string;
};


export default function AppointmentsPage() {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [appointmentType, setAppointmentType] = useState("Walk-in");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
  ];

  const toggleModal = () => setModalOpen(!modalOpen);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        fetchAPI("/clinic/appointments/today"),
        fetchAPI("/clinic/patients"),
        fetchAPI("/clinic/doctors"),
      ]);

      console.log("Fetched Appointments Data:", appointmentsData); // <-- ADD THIS LOG

      setAppointments(appointmentsData); 
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error(err);
      setError("Failed to load data from backend.");
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  console.log('Current Patients State:', patients); // <-- ADD THIS LOG

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !selectedPatient || !selectedDoctor || !appointmentDate || !reason) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient,
          doctorId: selectedDoctor,
          type: appointmentType,
          date: appointmentDate,
          time: selectedTime,
          reason,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAppointments((prev) => [...prev, data]);
        toggleModal();
        setSelectedPatient("");
        setSelectedDoctor("");
        setAppointmentDate("");
        setReason("");
        setSelectedTime("");
        setAppointmentType("Walk-in");
      } else {
        alert(data.message || "Failed to create appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  const getStatusClass = (status: string): string => {
  const lowerStatus = status?.toLowerCase(); // Handle potential null/undefined status
  switch (lowerStatus) {
    case 'scheduled':
      return 'primary'; // Or 'pending' if you prefer yellow for scheduled
    case 'completed':
      return 'ok'; // Matches .status-pill.completed in your CSS
    case 'cancelled': // Add a case for cancelled if needed
      return 'bad';
    // Add other cases as needed based on your possible status values
    default:
      return 'upcoming'; // Default grey pill
  }
};
  // -------------------------
  // Render
  // -------------------------
  return (
    <>
      <Header />
      {/* Removed p-4, assuming main/body handles padding */}
       <main className="body">
      
        {/* Header + Filters */}
        {/* Use .card class, add inline style for margin-bottom */}
        <div className="card" style={{ maxWidth: "1280px", margin: "16px auto" }}>
                  {/* Use .row class, add inline style for alignment and margin */}
          <div
            className="row"
            style={{ alignItems: "center", marginBottom: "16px" }}
          >
            {/* Use default <input> styling from CSS, add inline style for max-width */}
           <h2> Appointment Manager</h2>
            <input
              type="date"
              style={{ maxWidth: "180px" }}
              // Set the default value to today's date in YYYY-MM-DD format
              defaultValue={new Date().toISOString().split('T')[0]} 
            />
            {/* Use default <input> styling from CSS, add inline style for max-width */}
            <input
              type="text"
              placeholder="🔍 Search patient or phone..."
              style={{ maxWidth: "250px" }}
              // Note: This input is currently uncontrolled.
            />
            {/* Use .btn, .ok, and .right classes */}
            <button className="btn ok right" onClick={toggleModal}>
              ＋ Book Appointment
            </button>
          </div>

          {/* Appointments Table */}
          {/* Use inline style for overflow-x */}
          <div style={{ overflowX: "auto" }}>
            {loading ? (
              <p>Loading appointments...</p>
            ) : error ? (
              // Use inline style for error color
              <p style={{ color: "var(--bad)" }}>{error}</p>
            ) : (
              // Use default <table> styling from CSS
              <table>
                {/* Use default <thead> styling from CSS */}
                <thead>
                  <tr>
                    {[
                      "Time",
                      "Patient",
                      "Doctor",
                      "Reason",
                      "Type",
                      "Status",
                      "Actions",
                    ].map((th) => (
                      // Use default <th> styling from CSS
                      <th key={th}>{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      {/* Use default <td> styling, add inline style for text-align */}
                      <td colSpan={7} style={{ textAlign: "center" }}>
                        No appointments today.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id}>
                        {/* Use default <td> styling from CSS */}
                        <td>{appt.time}</td>
                        <td>{appt.patientName}</td>
                        <td>{appt.doctorName}</td>
                        <td>{appt.reason}</td>
                        <td>
                          <span className="status-pill ordered">{appt.type}</span></td>
                        <td>
                          <span className={`status-pill ${getStatusClass(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                        {/* Remind Button */}
                        <button 
                          className="btn warn" // Use 'warn' style (orange)
                          onClick={() => alert(`Reminder action for appointment ${appt.id}`)}
                          style={{ marginRight: '8px' }} // Add some space between buttons
                        >
                          Remind
                        </button>
                        
                        {/* Cancel Button */}
                        <button 
                          className="btn bad" // Use 'bad' style (red)
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel the appointment for ${appt.patientName}?`)) {
                              // Add logic here to call an API to cancel the appointment
                              alert(`Cancel action for appointment ${appt.id}`); 
                            }
                          }}
                        >
                          Cancel
                        </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {modalOpen && (
          // Use .modal-overlay class
          <div className="modal-overlay">
            {/* Use .modal-content class */}
            <div className="modal-content">
              {/* Use .modal-header class */}
              <div className="modal-header">
                {/* <h2> is styled by .modal-header h2 */}
                <h2>Book New Appointment</h2>
                {/* Use .modal-close class */}
                <button onClick={toggleModal} className="modal-close">
                  ×
                </button>
              </div>

              {/* Use .form-grid class */}
              <form className="form-grid">
                <div>
                  <label>Patient</label>
                  {/* Use default <select> styling */}
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Doctor</label>
                  {/* Use default <select> styling */}
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      required
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((d) => (
                        // Make sure this uses d.id
                        <option key={d.id} value={d.id}> 
                          {d.name} 
                        </option>
                      ))}
                    </select>
                </div>

                <div>
                  <label>Appointment Type</label>
                  {/* Use default <select> styling */}
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    required
                  >
                    <option>Walk-in</option>
                    <option>Online</option>
                  </select>
                </div>

                <div>
                  <label>Date</label>
                  {/* Use default <input> styling */}
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>

                {/* Use .full-width class to span columns */}
                <div className="full-width">
                  <label>Available Time Slots</label>
                  {/* Use .time-slots class */}
                  <div className="time-slots">
                    {timeSlots.map((slot) => (
                      <div
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        // Use .time-slot and .selected classes
                        className={`time-slot ${
                          selectedTime === slot ? "selected" : ""
                        }`}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                  <input type="hidden" value={selectedTime} required />
                </div>

                {/* Use .full-width class to span columns */}
                <div className="full-width">
                  <label>Reason for Visit</label>
                  {/* Use default <input> styling */}
                  <input
                    type="text"
                    placeholder="Routine Checkup, Vaccination"
                    className="border rounded px-2 py-1"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </form>

              {/* Use .btn and .ok classes, add inline style for margin-top */}
              <button
                className="btn ok"
                style={{ marginTop: "16px" }}
                onClick={handleConfirmAppointment}
              >
                Confirm Appointment
              </button>
            </div>
          </div>
        )}
       </main >
    </>
     
  );
}
