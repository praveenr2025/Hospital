"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/layout/admin/Header";
import { format, addDays, startOfWeek } from "date-fns"; // npm i date-fns

// Define shift options based on your screenshots
const SHIFT_OPTIONS = [
  "OFF",
  "DAY (9A-5P)",
  "MORNING (7A-3P)",
  "EVENING (3P-11P)",
  "NIGHT (11P-7A)",
  "Main Clinic (8A-1P)",
  "Telehealth (2P-5P)",
  "Surgery (8A-4P)",
  "Evening Ward (2P-10P)",
  "On-Call",
];

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

export default function RosterPage() {
  const [rosterData, setRosterData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  
  const [allRoles, setAllRoles] = useState(["All"]);
  const [allDepts, setAllDepts] = useState(["All"]);

  // State for the modal
  const [modalState, setModalState] = useState({
    show: false,
    staff: null,
    dayKey: null,
    dayLabel: null,
  });
  // State for the modal's dropdown
  const [newShift, setNewShift] = useState(SHIFT_OPTIONS[0]);

  const getWeekDays = (startDate) => {
    const start = startOfWeek(new Date(startDate || new Date()), {
      weekStartsOn: 1,
    }); // Monday start
    return Array.from({ length: 7 }, (_, i) => ({
      label: format(addDays(start, i), "EEE, dd MMM"),
      key: format(addDays(start, i), "yyyy-MM-dd"),
    }));
  };

  const weekDays = getWeekDays(selectedDate);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, rosterRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/staff"),
          axios.get("http://localhost:5000/api/admin/roster"),
        ]);

        const staffList = staffRes.data.map((s) => ({
          id: s.id,
          name: s.full_name || s.name,
          role: s.role,
          department: s.department,
          shifts: {}, // empty, will fill from roster
        }));

        // Merge roster data into staff
        rosterRes.data.forEach((r) => {
          const staff = staffList.find((s) => s.id === r.staff_id);
          if (staff) {
            staff.shifts =
              typeof r.shifts === "string" ? JSON.parse(r.shifts) : r.shifts;
          }
        });

        setRosterData(staffList);
        
        // Populate filters
        setAllRoles(['All', ...new Set(staffList.map(s => s.role).filter(Boolean))]);
        setAllDepts(['All', ...new Set(staffList.map(s => s.department).filter(Boolean))]);

      } catch (err) {
        console.error("Error fetching staff/roster data:", err);
      }
    };

    fetchData();
  }, []);

  // --- Modal and Assignment Logic ---

  const openAssignmentModal = (staff, day) => {
    setModalState({
      show: true,
      staff: staff,
      dayKey: day.key,
      dayLabel: day.label,
    });
    setNewShift(SHIFT_OPTIONS[0]); // Reset dropdown on open
  };

  const closeAssignmentModal = () => {
    setModalState({ show: false, staff: null, dayKey: null, dayLabel: null });
  };

  /**
   * Universal function to update assignments for a staff/day
   */
  const handleAssignmentChange = (staffId, dayKey, newShiftsForDay) => {
    const staff = rosterData.find((s) => s.id === staffId);
    if (!staff) return;

    const updatedShifts = { ...staff.shifts, [dayKey]: newShiftsForDay };
    const weekStart = format(startOfWeek(new Date(dayKey), { weekStartsOn: 1 }), "yyyy-MM-dd");

    // 1. Send to backend
    axios
      .post("http://localhost:5000/api/admin/roster", {
        staffId: staffId,
        weekStart,
        shifts: updatedShifts,
      })
      .catch(console.error); // Fire-and-forget for optimistic update

    // 2. Update local rosterData state
    setRosterData((prevData) =>
      prevData.map((s) =>
        s.id === staffId ? { ...s, shifts: updatedShifts } : s
      )
    );

    // 3. Update the staff object inside the modalState for instant refresh
    setModalState((prevModal) => ({
      ...prevModal,
      staff: { ...prevModal.staff, shifts: updatedShifts },
    }));
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    const { staff, dayKey } = modalState;
    const currentShifts = staff.shifts?.[dayKey] || [];

    // Add new shift if it's not "OFF" and not already present
    if (newShift !== "OFF" && !currentShifts.includes(newShift)) {
      const newShiftsForDay = [...currentShifts, newShift];
      handleAssignmentChange(staff.id, dayKey, newShiftsForDay);
    } else if (newShift === "OFF") {
      // Special case: "OFF" replaces all other shifts
      handleAssignmentChange(staff.id, dayKey, ["OFF"]);
    }
    setNewShift(SHIFT_OPTIONS[0]); // Reset dropdown
  };

  const handleDeleteAssignment = (shiftToDelete) => {
    const { staff, dayKey } = modalState;
    const currentShifts = staff.shifts?.[dayKey] || [];
    const newShiftsForDay = currentShifts.filter((s) => s !== shiftToDelete);

    handleAssignmentChange(staff.id, dayKey, newShiftsForDay);
  };

  const handlePublishWeek = () => alert("Weekly roster has been published!");

  // Filter staff based on dropdowns
  const filteredStaff = rosterData.filter((staff) => {
    const roleMatch = selectedRole === "All" || staff.role === selectedRole;
    const deptMatch = selectedDept === "All" || staff.department === selectedDept;
    return roleMatch && deptMatch;
  });

  return (
    <>
      <Header />
      <main className="body">
      <div className="page active container">
        <div className="card">
          <div className="row" style={{ maxWidth: "1580px", margin: "16px auto" }}>
            <h2>Weekly Roster</h2>
            <input
              type="date"
              style={{ maxWidth: 180, marginLeft: 16 }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <select
              style={{ maxWidth: 200 }}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {allRoles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
            </select>
            <select
              style={{ maxWidth: 200 }}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {allDepts.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </select>
            <button className="btn ok right" onClick={handlePublishWeek}>
              ✓ Publish Week
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table id="roster-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  {weekDays.map((day) => (
                    <th key={day.key}>{day.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{staff.name}</div>
                      <div className="muted" style={{ fontSize: "18px" }}>
                        {staff.role}
                      </div>
                    </td>
                    {weekDays.map((day) => (
                      <td key={day.key}>
                        <div className="roster-cell-content">
                          {(staff.shifts?.[day.key] || []).length === 0 && (
                            <span
                              className="muted"
                              style={{ fontSize: "18px" }}
                            >
                              No assignments
                            </span>
                          )}
                          {(staff.shifts?.[day.key] || []).map((shift) => (
                            <div
                              key={shift}
                              className="roster-pill clickable"
                              data-shift-type={getShiftType(shift)}
                              onClick={() => openAssignmentModal(staff, day)}
                            >
                              {shift}
                            </div>
                          ))}
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--primary)",
                              cursor: "pointer",
                              padding: "4px 0",
                              fontSize: "18px",
                              marginTop: "5px",
                              textAlign: "left"
                            }}
                            onClick={() => openAssignmentModal(staff, day)}
                          >
                            ＋ Add
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalState.show && (
        <div className="modal-overlay" onClick={closeAssignmentModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Edit Assignments</h2>
              <button className="modal-close" onClick={closeAssignmentModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: "18px" }}>
                For: <strong>{modalState.staff.name}</strong>
                <br />
                Date: <strong>{modalState.dayLabel}</strong>
              </p>

              <hr style={{ borderColor: "var(--muted)", margin: "16px 0" }} />

              <h4>Current Assignments</h4>
              <div className="list">
                {(modalState.staff.shifts?.[modalState.dayKey] || []).length ===
                0 ? (
                  <p className="muted" style={{ fontSize: "18px" }}>No assignments for this day.</p>
                ) : (
                  (modalState.staff.shifts?.[modalState.dayKey] || []).map(
                    (shift) => (
                      <div
                        key={shift}
                        className="inline"
                        style={{
                          justifyContent: "space-between",
                          padding: "8px",
                          background: "var(--bg)",
                          borderRadius: "8px",
                          alignItems: "center"
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{shift}</span>
                        <button
                          className="btn bad"
                          onClick={() => handleDeleteAssignment(shift)}
                        >
                          Delete
                        </button>
                      </div>
                    )
                  )
                )}
              </div>

              <hr style={{ borderColor: "var(--muted)", margin: "16px 0" }} />

              <h4>Add New Assignment</h4>
              <form
                onSubmit={handleAddAssignment}
                className="row"
                style={{ alignItems: "center" }}
              >
                <select
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value)}
                  style={{ flex: 1, width: "auto" }}
                >
                  {SHIFT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn ok">
                  ＋ Add Assignment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}