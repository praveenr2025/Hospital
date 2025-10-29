"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { format, addDays, startOfWeek } from "date-fns";
import Header from "../../../components/layout/admin/Header";

// Helper function to get the current week's days
const getWeekDays = (startDate) => {
  const start = startOfWeek(new Date(startDate || new Date()), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      dayLabel: format(date, "EEEE"), // "Monday"
      dateLabel: format(date, "dd MMM"), // "13 Oct"
      key: format(date, "yyyy-MM-dd"), // "2025-10-13"
    };
  });
};

// Helper function to get a type for styling the pills from your global.css
const getShiftType = (shiftString) => {
  if (!shiftString) return "OFF";
  const upper = shiftString.toUpperCase();
  if (upper.startsWith("OFF")) return "OFF";
  if (upper.startsWith("DAY")) return "DAY";
  if (upper.startsWith("MORNING")) return "MORNING";
  if (upper.startsWith("EVENING")) return "EVENING";
  if (upper.startsWith("NIGHT")) return "NIGHT";
  return "DAY"; // Default for "Main Clinic", "Surgery" etc.
};


export default function StaffProfilePage() {
  const router = useRouter();
  const { id } = router.query; // Get the [id] from the URL

  const [staff, setStaff] = useState(null); // Start as null
  const [rosterShifts, setRosterShifts] = useState({});
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false); // To toggle input

  const weekDays = getWeekDays(new Date()); // Get This Week

  // Fetch all data when the 'id' from the URL is available
  useEffect(() => {
    if (!id) return; // Wait until the router is ready

    const fetchProfileData = async () => {
      try {
        // Fetch staff details, their roster, and their notes in parallel
        const [staffRes, rosterRes, notesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/admin/staff/${id}`),
          axios.get("http://localhost:5000/api/admin/roster"), // Fetches all rosters
          axios.get(`http://localhost:5000/api/admin/staff/${id}/notes`), // Assumes a notes endpoint
        ]);

        // Set Staff Details
        setStaff(staffRes.data);

        // Find and set this staff's roster
        const allRosters = rosterRes.data;
        const staffRoster = allRosters.find(
          (r) => r.staff_id === staffRes.data.id
        );
        if (staffRoster && staffRoster.shifts) {
          setRosterShifts(staffRoster.shifts);
        }

        // Set Notes
        setNotes(notesRes.data);
      } catch (err) {
        console.error("Failed to fetch staff profile:", err);
        // Handle error, e.g., redirect or show message
      }
    };

    fetchProfileData();
  }, [id]); // Re-run if the id changes

  // Save a new note to the backend
  const handleAddNote = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!newNote.trim() || !id) return;

    const noteObj = {
      note: newNote,
      date: new Date().toISOString(), // Send full ISO string
      staff_id: id,
    };

    try {
      // POST to backend
      const res = await axios.post(
        `http://localhost:5000/api/admin/staff/${id}/notes`,
        noteObj
      );

      // Add the *returned* note (which now has a DB ID) to the top of the list
      setNotes([res.data, ...notes]);
      setNewNote("");
      setShowNoteInput(false); // Hide input after saving
    } catch (err) {
      console.error("Failed to save note:", err);
      alert("Failed to save note.");
    }
  };

  // Show loading state until staff data is fetched
  if (!staff) {
    return (
      <>
        <Header />
        <div className="page active container">
          <p>Loading staff profile...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div id="staffProfilePage" className="page active container">
        {/* Back Button */}
        <div style={{ marginBottom: 24 }}>
          <button
            className="btn ghost"
            onClick={() => router.push("/admin/staff")}
            style={{ border: "none", background: "none", color: "var(--primary)", padding: 0 }}
          >
            ← Back to Staff Directory
          </button>
        </div>

        {/* Grid Layout */}
        <div className="grid">
          {/* Left Column */}
          <div className="cols-1">
            
            {/* Staff Info (No Card) */}
            <div style={{ padding: '0 10px' }}>
              <h3 id="profile-staff-name" style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>
                {staff.full_name}
              </h3>
              <p className="muted" id="profile-staff-role-dept" style={{ fontSize: '18px' }}>
                {`${staff.role} - ${staff.department}`}
              </p>
              <hr style={{ borderColor: "var(--muted)", borderStyle: "dashed", margin: "20px 0" }} />

              <h4 style={{ fontSize: '18px', color: '#1e293b' }}>Contact Information</h4>
              <p className="footnote" id="profile-staff-contact">
                Contact: {staff.contact || "N/A"}
              </p>
              <p className="footnote" id="profile-staff-email">
                Email: {staff.email || "N/A"}
              </p>
              <div className="inline" style={{ alignItems: 'center' }}>
                <p className="footnote" id="profile-staff-status" style={{ margin: 0 }}>
                  Status:
                </p>
                <span 
                  className={`status-pill ${staff.status === 'Active' ? 'ok' : 'upcoming'}`}
                  style={{ marginLeft: 8 }}
                >
                  {staff.status}
                </span>
              </div>
            </div>

            {/* Weekly Roster */}
            <div className="card" style={{ marginTop: 24 }}>
              <h4>This Week's Roster</h4>
              <table id="profile-roster-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Assignments</th>
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day) => (
                    <tr key={day.key}>
                      <td>
                        <strong style={{ display: 'block' }}>{day.dayLabel}</strong>
                        <span className="muted" style={{ fontSize: '18px' }}>{day.dateLabel}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-start' }}>
                          {(rosterShifts[day.key] || []).length === 0 ? (
                            <span className="muted" style={{ fontSize: '18px' }}>OFF</span>
                          ) : (
                            rosterShifts[day.key].map((shift, idx) => (
                              <div
                                key={idx}
                                className="roster-pill"
                                data-shift-type={getShiftType(shift)}
                              >
                                {shift}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="cols-2">
            <div className="card">
              <div className="row" style={{ alignItems: "center", marginBottom: 8 }}>
                <h3>Activity & Notes</h3>
                <button
                  className="btn ok right"
                  id="toggle-note-btn"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                >
                  {showNoteInput ? "Cancel" : "＋ Log New Note"}
                </button>
              </div>

              {/* Conditionally rendered note input form */}
              {showNoteInput && (
                <form onSubmit={handleAddNote} className="row" style={{ background: 'var(--bg)', padding: '12px', borderRadius: '12px' }}>
                  <input
                    type="text"
                    placeholder="Write a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    style={{ width: "100%", marginBottom: "8px" }}
                  />
                  <button
                    type="submit"
                    className="btn ok right"
                    disabled={!newNote.trim()}
                  >
                    Save Note
                  </button>
                </form>
              )}

              {/* Activity Timeline */}
              <ul className="timeline" style={{ marginTop: '20px' }}>
                {notes.length ? (
                  notes.map((n) => (
                    <li key={n.id} className="timeline-item">
                      <div className="timeline-icon warn">📝</div>
                      <div className="timeline-content">
                        <strong>
                          Note - {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </strong>
                        <p style={{ margin: 0, color: 'var(--ink-soft)' }}>{n.note}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="muted" style={{ padding: '0 20px' }}>No activity notes yet.</p>
                )}
                {/* --- Example of other items from your design --- */}
                {/* <li className="timeline-item">
                  <div className="timeline-icon accent">🩺</div>
                  <div className="timeline-content">
                    <strong>Appointment - 13 Oct 2025</strong>
                    <p style={{ margin: 0, color: 'var(--ink-soft)' }}>Appointment Scheduled: 5-week checkup for Zoya Khan</p>
                  </div>
                </li> */}
              </ul>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}