"use client";

import React, { useState, useEffect } from "react";
import Header from "../../components/layout/admin/Header";
// Assuming global.css is linked in your layout, otherwise, import it here
// import "./global.css"; 

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

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({
    totalStaff: 0,
    onDuty: 0,
    patientsToday: 0,
    pendingInvoices: 0,
    pendingLabs: 0,
    openReferrals: 0,
  });

  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [alerts, setAlerts] = useState([]);

  // Unique roles & departments for filter dropdowns
  const roles = [...new Set(staffList.map((s) => s.role).filter(Boolean))];
  const departments = [
    ...new Set(staffList.map((s) => s.department).filter(Boolean)),
  ];

  const fetchJSON = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };


  const fetchKPIs = async () => {
    try {
const [
        staff,
        roster,
        patients,
        invoices,
        labs,
        referrals,
        lowStock, // <-- Add this variable
      ] = await Promise.all([
        fetchJSON("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/staff"),
        fetchJSON("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/roster/today"),
        fetchJSON("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/appointments/today"),
        fetchJSON(
          "https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/invoices?status=Pending"
        ),
        fetchJSON(
          "https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/lab-orders?status=Pending"
        ),
        fetchJSON("https://bankreconn.centralindia.cloudapp.azure.com/api/clinic/referrals?status=Sent"),
        fetchJSON("https://bankreconn.centralindia.cloudapp.azure.com/api/admin/inventory/low-stock"), // <-- Add this API call
      ]);
      // Update KPIs
      setKpis({
        totalStaff: staff.length,
        onDuty: roster.length,
        patientsToday: patients.length,
        pendingInvoices: invoices.length,
        pendingLabs: labs.length,
        openReferrals: referrals.length,
      });

      // Staff on duty today
      // Parse shifts if they are JSON strings
      const parsedRoster = roster.map(s => ({
        ...s,
        shifts: (s.shifts && typeof s.shifts === 'string') ? JSON.parse(s.shifts) : s.shifts
      }));
      setStaffList(parsedRoster);
      setFilteredStaff(parsedRoster);

      // Alerts - Now populated from lowStock fetch per design
      const alertItems = [
        ...lowStock.map((item) => ({
          id: `stock-${item.id}`,
          type: "Low Stock",
          // Format message like "DTaP: 1 (8 left)"
          message: `${item.name}: ${item.quantity_in_stock} (${item.reorder_level} left)`,
        })),
      ];
      setAlerts(alertItems);

    } catch (err) {
      console.error("Failed to fetch KPIs:", err);
    }
  };

  // Filter staff list
  useEffect(() => {
    let filtered = [...staffList];
    if (roleFilter) filtered = filtered.filter((s) => s.role === roleFilter);
    if (deptFilter)
      filtered = filtered.filter((s) => s.department === deptFilter);
    setFilteredStaff(filtered);
  }, [roleFilter, deptFilter, staffList]);

  useEffect(() => {
    fetchKPIs();
  }, []);

  return (
    <>
      <Header />
      <div id="dashboardPage" className="page active container">
        <div className="grid">
          {/* KPIs - Styled as text per design */}
         <div className="kpis">
            <div className="kpi">
              <h3>Total Staff</h3>
              <div className="v">{kpis.totalStaff}</div>
            </div>
            <div className="kpi">
              <h3>Staff On Duty Today</h3>
              <div className="v">{kpis.onDuty}</div>
            </div>
            <div className="kpi">
              <h3>Patients Today</h3>
              <div className="v">{kpis.patientsToday}</div>
            </div>
            <div className="kpi">
              <h3>Pending Invoices</h3>
              <div className="v">{kpis.pendingInvoices}</div>
            </div>
            <div className="kpi">
              <h3>Pending Lab Results</h3>
              <div className="v">{kpis.pendingLabs}</div>
            </div>
            <div className="kpi">
              <h3>Open Referrals</h3>
              <div className="v">{kpis.openReferrals}</div>
            </div>
          </div>
         

          {/* Staff On Duty Today Card */}
          <div className="card cols-2">
            <h3>Staff On Duty Today</h3>
            <div className="row" style={{ alignItems: "center" }}>
              <label
                htmlFor="dash-role-filter"
                style={{ fontSize: "18px", margin: 0 }}
              >
                Filter by:
              </label>
              <select
                id="dash-role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                id="dash-dept-filter"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Styled list per design */}
            <div id="dashboard-onduty-list" className="list">
              {filteredStaff
                .filter(
                  (value, index, self) =>
                    index ===
                    self.findIndex((s) => s.staff_id === value.staff_id)
                )
                .map((s, idx) => {
                  const today = new Date().toISOString().split("T")[0];
                  let todayShifts = s.shifts?.[today] || [];
                  if (!Array.isArray(todayShifts)) {
                    todayShifts = todayShifts ? [todayShifts] : [];
                  }

                  return (
                    <div 
                      key={s.staff_id || s.full_name + idx} 
                      className="dashboard-item"
                      style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                      {/* Name and Role */}
                      <div style={{ fontSize: '18px' }}>
                        <strong style={{ color: 'var(--primary)' }}>{s.full_name}</strong>
                        <span className="muted" style={{ marginLeft: '8px' }}>({s.role})</span>
                      </div>
                      
                      {/* Shifts as Pills */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {todayShifts.length > 0 && todayShifts[0] !== "" ? (
                          todayShifts.map((shift, idx) => (
                            <div
                              key={idx}
                              className="roster-pill"
                              data-shift-type={getShiftType(shift)}
                            >
                              {shift}
                            </div>
                          ))
                        ) : (
                          <div
                            className="roster-pill"
                            data-shift-type="OFF"
                          >
                            No shift today
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* System Alerts Card - Styled per design */}
          <div className="card cols-1">
            <h3>System Alerts</h3>
            <div id="dashboard-alerts-list" className="list">
              {alerts.length === 0 ? (
                <p style={{ fontSize: "18px" }}>No alerts</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="dashboard-item">
                    <span style={{ 
                      width: 10, 
                      height: 10, 
                      backgroundColor: 'var(--bad)', 
                      borderRadius: '50%',
                      flexShrink: 0
                    }}></span>
                    <strong style={{ color: 'var(--bad)' }}>{alert.type}:</strong>
                    <span className="muted" style={{ marginLeft: '8px' }}>
                      {alert.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
