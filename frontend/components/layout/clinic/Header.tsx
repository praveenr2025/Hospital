"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchUserProfile } from "@/utils/auth"; // make sure this file exists as we discussed

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; role?: string } | null>(null);
  const router = useRouter();

  // 🧠 Fetch logged-in user when component mounts
  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserProfile();
      if (data) setUser(data);
    };
    loadUser();
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.removeItem("hospitalToken");
    router.push("/");
  };

  return (
    <header>
      <div className="container hero">
        {/* === Left Section: Logo & Clinic Info === */}
        <div
          className="hero-left"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          <div className="logo">🩺</div>
          <div>
            <h1>PediaTrack Portal</h1>
            <div className="sub">Dr. Eleanor Vance&apos;s Clinic</div>
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

        {/* === Right Section: Dynamic User Display === */}
        <div className="user-profile">
          <div
            className={`user-profile-toggle ${dropdownOpen ? "active" : ""}`}
            onClick={toggleDropdown}
          >
            <div className="avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="name">
              {user
                ? `${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} – ${user.full_name}`
                : "Loading..."}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
