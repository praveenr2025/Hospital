"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const navLinks = [
    { href: "/clinic/dashboard", label: "Dashboard" },
    { href: "/clinic/appointments", label: "Appointments" },
    { href: "/clinic/patients", label: "Patients" },
    { href: "/clinic/inventory", label: "Inventory" },
    { href: "/clinic/billing", label: "Billing" },
    { href: "/clinic/lab-radiology", label: "Lab & Radiology" },
    { href: "/clinic/referrals", label: "Referrals" },
  ];

  return (
    <header>
      <div className="container hero">
        {/* === Left Section === */}
        <div
          className="hero-left"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div className="logo">🩺</div>
          <div>
            <h2>PediaTrack Portal</h2>
            <div className="sub">Dr. Eleanor Vance's Clinic</div>
          </div>
        </div>

        {/* === Center Navigation === */}
        <nav>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* === Right Section === */}
        <div className="user-profile">
          <div
            className={`user-profile-toggle ${dropdownOpen ? "active" : ""}`}
            onClick={toggleDropdown}
          >
            <div className="avatar">EV</div>
            <span className="name">Dr. Eleanor Vance</span>
            <span className="chevron">▼</span>
          </div>

          {dropdownOpen && (
            <div className="user-profile-dropdown show">
              <Link href="/clinic/doctor-profile"> View Profile</Link>
              <Link href="#"> Change Password</Link>
              <div className="dropdown-divider"></div>
              <a className="logout" onClick={handleLogout}>
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
