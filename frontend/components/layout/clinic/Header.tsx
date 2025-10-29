"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <header>
      <div className="container hero">
        {/* === Left Section: Logo & Clinic Info === */}
        <div className="hero-left" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div className="logo">🩺</div>
          <div>
            <h1>PediaTrack Portal</h1>
            <div className="sub">Dr. Eleanor Vance's Clinic</div>
          </div>
        </div>

        {/* === Center Navigation === */}
        <nav>
          <Link href="/clinic/dashboard" className="active">
            Dashboard
          </Link>
          <Link href="/clinic/appointments">Appointments</Link>
          <Link href="/clinic/patients">Patients</Link>
          <Link href="/clinic/inventory">Inventory</Link>
          <Link href="/clinic/billing">Billing</Link>
          <Link href="/clinic/lab-radiology">Lab & Radiology</Link>
          <Link href="/clinic/referrals">Referrals</Link>
        </nav>

        {/* === Right Section: Profile Dropdown === */}
        <div className="user-profile">
          <div
            className={`user-profile-toggle ${dropdownOpen ? "active" : ""}`}
            onClick={toggleDropdown}
          >
            <div className="avatar">EV</div>
            <span className="name">Dr. Eleanor Vance</span>
            <span className="chevron">▼</span>
          </div>

          <div className={`user-profile-dropdown ${dropdownOpen ? "show" : ""}`}>
            <Link href="/clinic/doctor-profile">👤 View Profile</Link>
            <Link href="#">🔑 Change Password</Link>
            <div className="dropdown-divider"></div>
            <a className="logout" onClick={handleLogout}>
              🚪 Logout
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
