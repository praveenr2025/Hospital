"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"; // Added for navigation
import Header from "../../components/layout/admin/Header";
// Assuming global.css is linked in your layout, otherwise, import it here
// import "./global.css";

// Static lists for filters, as in your original code
const allRoles = ['Doctor', 'Nurse', 'Lab Technician', 'Receptionist', 'Admin', 'Radiologist', 'Surgeon'];
const allDepartments = ['Pediatrics', 'Cardiology', 'Lab', 'Radiology', 'Front Desk', 'Administration', 'Orthopedics'];

export default function AdminStaff() {
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [editingStaff, setEditingStaff] = useState(null); // To track if editing

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");

  const [form, setForm] = useState({
    fullName: "",
    role: "",
    department: "",
    contact: "",
    email: "",
    password: "",
  });

  const resetForm = {
    fullName: "",
    role: "",
    department: "",
    contact: "",
    email: "",
    password: "",
  };

  // Load all staff on mount
  useEffect(() => {
    fetch("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff")
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch((err) => console.error("Error fetching staff:", err));
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.id.replace("staff-", "")]: e.target.value });
  };

  // --- Modal Controls ---
  const openModal = (staff = null) => {
    if (staff) {
      // Edit mode
      setEditingStaff(staff);
      setForm({
        fullName: staff.full_name || "",
        role: staff.role || "",
        department: staff.department || "",
        contact: staff.contact || "",
        email: staff.email || "",
        password: "", // Always clear password field
      });
    } else {
      // Add mode
      setEditingStaff(null);
      setForm(resetForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setForm(resetForm);
  };

  // --- Data Handlers ---

  // Handles both Add New and Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!editingStaff;
    
    const url = isEditing
      ? `https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff/${editingStaff.id}`
      : "https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff";
      
    const method = isEditing ? "PUT" : "POST";

    // Prepare payload, ensuring "fullName" is "full_name" for the backend
const payload = {
        ...form, // This already contains the correct 'fullName'
        status: isEditing ? editingStaff.status : 'Active'
    };

    if (!payload.password) delete payload.password; // Don't send empty password

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error saving staff");

      if (isEditing) {
        // Update the staff member in the list
        setStaffList(
          staffList.map((s) => (s.id === editingStaff.id ? data : s))
        );
      } else {
        // Add the new staff member to the list
        setStaffList([...staffList, data]);
      }

      closeModal();
    } catch (err) {
      console.error("Error saving staff:", err);
      alert("Failed to save staff member");
    }
  };

  // Handle Activate/Deactivate
  const handleToggleStatus = async (staff, newStatus) => {
    
    // Optimistic update in UI
    setStaffList(staffList.map(s => 
      s.id === staff.id ? { ...s, status: newStatus } : s
    ));

    try {
        // Send the full staff object with the new status
        await fetch(`https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff/${staff.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...staff, full_name: staff.full_name, status: newStatus })
        });
    } catch (err) {
        console.error("Error updating status:", err);
        alert("Failed to update status. Reverting changes.");
        // Revert UI on failure
        setStaffList(staffList.map(s => 
            s.id === staff.id ? { ...s, status: staff.status } : s // Revert to old status
        ));
    }
  };

  // --- Filtering ---
  const filteredStaff = staffList.filter((staff) => {
    const nameMatch = (staff.full_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === "All" || staff.role === roleFilter;
    const deptMatch = deptFilter === "All" || staff.department === deptFilter;
    return nameMatch && roleMatch && deptMatch;
  });

  return (
    <>
      <Header />
      <div id="staffPage" className="page active container">
        <div className="card">
          <div className="row" style={{ alignItems: "center", marginBottom: 20 }}>
            <h2>Staff Directory</h2>
            
            {/* --- Filters --- */}
            <input
              type="text"
              placeholder="🔍 Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginLeft: 16, width: 250 }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ marginLeft: 16 }}
            >
              <option value="All">All Roles</option>
              {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ marginLeft: 16 }}
            >
              <option value="All">All Departments</option>
              {allDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            
            <button className="btn ok right" onClick={() => openModal(null)}>
              ＋ Add New Staff
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table id="staff-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th> {/* Added Actions Header */}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    {/* Name as a Link */}
                    <td>
                      {/* --- FIX IS HERE --- */}
                      <Link href={`/admin/staffprofile/${staff.id}`} passHref legacyBehavior>
                        <a style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {staff.full_name}
                        </a>
                      </Link>
                    </td>
                    <td>{staff.role}</td>
                    <td>{staff.department}</td>
                    <td>{staff.contact}</td>
                    <td>{staff.email}</td>
                    {/* Status as a Pill */}
                    <td>
                      <span className={`status-pill ${
                        staff.status === 'Active' ? 'ok' : 'upcoming'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    {/* Action Buttons */}
                    <td>
                      <button className="btn ghost" onClick={() => openModal(staff)}>
                        Edit
                      </button>
                      {staff.status === 'Active' ? (
                        <button
                          className="btn bad"
                          style={{ marginLeft: 8 }}
                          onClick={() => handleToggleStatus(staff, 'Inactive')}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn ok"
                          style={{ marginLeft: 8 }}
                          onClick={() => handleToggleStatus(staff, 'Active')}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 600 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              {/* Dynamic Modal Title */}
              <h2>{editingStaff ? "Edit Staff" : "Add New Staff"}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="full-width">
                    <label>Full Name</label>
                    <input id="staff-fullName" value={form.fullName} onChange={handleChange} required />
                  </div>

                  <div>
                    <label>Role</label>
                    <select id="staff-role" value={form.role} onChange={handleChange} required>
                      <option value="">Select Role</option>
                      {allRoles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Department</label>
                    <select id="staff-department" value={form.department} onChange={handleChange} required>
                      <option value="">Select Department</option>
                      {allDepartments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Contact Number</label>
                    <input id="staff-contact" value={form.contact} onChange={handleChange} />
                  </div>

                  <div>
                    <label>Email</label>
                    <input id="staff-email" type="email" value={form.email} onChange={handleChange} />
                  </div>

                  <div>
                    <label>Password</label>
                    <input id="staff-password" type="password" value={form.password} onChange={handleChange} placeholder={editingStaff ? "Leave blank to keep unchanged" : ""} />
                  </div>
                </div>

                <button type="submit" className="btn ok right" style={{ marginTop: 20 }}>
                  Save Staff Member
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
