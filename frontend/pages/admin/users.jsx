"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/layout/admin/Header";
import { useRouter } from "next/router";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [activeUserId, setActiveUserId] = useState(null);

  const activeUser = users.find((u) => u.id === activeUserId);

  const openModal = (id) => setActiveUserId(id);
  const closeModal = () => setActiveUserId(null);

  // Fetch staff from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff");
        const mappedUsers = res.data.map((u) => ({
          ...u,
          loginStatus: u.status, // map status column to loginStatus
        }));
        setUsers(mappedUsers);
      } catch (err) {
        console.error("Failed to fetch staff:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!activeUser) {
      alert("No user selected!");
      return;
    }

    const updatedRole = form.elements["user-security-role"].value;
    const updatedStatus =
      form.elements["user-login-status"].value === "Enabled"
        ? "Active"
        : "Disabled";

    try {
      const res = await axios.put(
        `https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff/${activeUser.id}`,
        {
          fullName: activeUser.full_name || activeUser.name,
          role: updatedRole,
          department: activeUser.department || null,
          contact: activeUser.contact || null,
          email: activeSUser.email || null,
          status: updatedStatus, // must match backend column
          password: null, // optional
        }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === activeUser.id
            ? { ...res.data, loginStatus: res.data.status } // map status to loginStatus
            : u
        )
      );

      closeModal();
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user");
    }
  };

  const handleResetPassword = () => {
    alert(`Password reset link sent to ${activeUser.email}`);
  };

  // Apply search & filters
  const filteredUsers = users.filter((u) => {
    return (
      (searchTerm === "" ||
        (u.full_name || u.name)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (roleFilter === "All" || u.role === roleFilter) &&
      (statusFilter === "All" || u.loginStatus === statusFilter)
    );
  });

  return (
    <>
      <Header />
      {/* Replaced 'p-6' with 'container' */}
      <main className="body">
      <div className="page active container">
        <div className="card"
        tyle={{ maxWidth: "2280px", margin: "16px auto" }}>
          <div className="row" style={{ alignItems: "center", marginBottom: 20 }}>
            <h2>User Account Management</h2>
            <input
              type="text"
              placeholder="🔍 Search by name..."
              style={{ maxWidth: 250, marginLeft: 16 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              style={{ maxWidth: 180 }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            <select
              style={{ maxWidth: 180 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Login Statuses</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
            <button
              className="btn ok right"
              onClick={() => {
                alert(
                  "Please create the new staff member first. A default user account will be created automatically, which you can then customize on this User Management page."
                );
                router.push("/admin/staff"); // redirect
              }}
            >
              ＋ Create New User Account
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table id="user-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Hospital Role</th>
                  <th>Security Role</th>
                  <th>Login Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.securityRole || user.role}</td>
                    <td>
                      {user.loginStatus === "Active" ? "Enabled" : "Disabled"}
                    </td>
                    <td>
                      <button
                        className="btn ok"
                        onClick={() => openModal(user.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn warn"
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ marginLeft: 8 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                Edit User Account for {activeUser.full_name || activeUser.name}
              </h2>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <form id="edit-user-form" onSubmit={handleSaveUser}>
                <div className="row">
                  <label htmlFor="user-security-role">Security Role</label>
                  <select
                    id="user-security-role"
                    defaultValue={activeUser.securityRole || activeUser.role}
                    required
                  >
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>
                  <p className="footnote" style={{ marginTop: 4 }}>
                    Controls access to different sections and features in the
                    portal.
                  </p>
                </div>

                <div className="row">
                  <label htmlFor="user-login-status">Login Status</label>
                  <select
                    id="user-login-status"
                    defaultValue={activeUser.loginStatus || "Enabled"}
                    required
                  >
                    <option value="Enabled">Enabled (Can Log In)</option>
                    <option value="Disabled">Disabled (Account Locked)</option>
                  </select>
                </div>

                <div className="row">
                  <label>Password Action</label>
                  <button
                    type="button"
                    className="btn warn"
                    style={{ width: "100%" }}
                    onClick={handleResetPassword}
                  >
                    🔑 Reset Password & Send Email
                  </button>
                  <p className="footnote" style={{ marginTop: 4 }}>
                    A temporary password link will be sent to the staff
                    member's email.
                  </p>
                </div>

                <button type="submit" className="btn ok right">
                  Save User Account
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
