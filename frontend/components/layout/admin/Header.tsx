// File: frontend/components/layout/admin/Header.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";




export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const pathname = usePathname();
    <Link href="/admin/dashboard" className={pathname === "/admin/dashboard" ? "nav-link active" : "nav-link"}>
    Dashboard
    </Link>

  return (
    <header>
      <div className="container">
        <div className="hero">
          {/* Logo */}
          <div className="logo">🏥</div>

          {/* Title */}
          <div>
            <h1>Hospital Admin Portal</h1>
            <div className="sub">Operations & Staff Management</div>
          </div>

          {/* Navigation */}
            <nav>
            <Link href="/admin/dashboard" className="nav-link">
                Dashboard
            </Link>
            <Link href="/admin/staff" className="nav-link">
                Staff Management
            </Link>
            <Link href="/admin/roster" className="nav-link">
                Roster
            </Link>
            <Link href="/admin/users" className="nav-link">
                User Management
            </Link>
            <Link href="/admin/settings" className="nav-link">
                System Settings
            </Link>
            </nav>


          {/* User Profile */}
          <div className="user-profile">
            <div
              className={`user-profile-toggle ${dropdownOpen ? "active" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar">SC</div>
              <div className="name">Admin - Sarah Chen</div>
              <span className="chevron">▼</span>
            </div>

            <div className={`user-profile-dropdown ${dropdownOpen ? "show" : ""}`}>
              <a href="#">👤 View Profile</a>
              <a href="#">🔑 Change Password</a>
              <div className="dropdown-divider"></div>
              <button
                onClick={handleLogout}
                className="logout w-full text-left"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
