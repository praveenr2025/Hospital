// File: frontend/components/layout/admin/Header.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchUserProfile } from "@/utils/auth";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; role?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserProfile();
      if (data) setUser(data.user);
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

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
            <Link
              href="/admin/dashboard"
              className={pathname === "/admin/dashboard" ? "nav-link active" : "nav-link"}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/staff"
              className={pathname === "/admin/staff" ? "nav-link active" : "nav-link"}
            >
              Staff Management
            </Link>
            <Link
              href="/admin/roster"
              className={pathname === "/admin/roster" ? "nav-link active" : "nav-link"}
            >
              Roster
            </Link>
            <Link
              href="/admin/users"
              className={pathname === "/admin/users" ? "nav-link active" : "nav-link"}
            >
              User Management
            </Link>
            <Link
              href="/admin/settings"
              className={pathname === "/admin/settings" ? "nav-link active" : "nav-link"}
            >
              System Settings
            </Link>
          </nav>

          {/* User Profile */}
          <div className="user-profile">
            <div
              className={`user-profile-toggle ${dropdownOpen ? "active" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="avatar">
                {user?.full_name
                  ? user.full_name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div className="name">
                {user
                  ? `${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} - ${user.full_name}`
                  : "Loading..."}
              </div>
              <span className="chevron">▼</span>
            </div>

            <div className={`user-profile-dropdown ${dropdownOpen ? "show" : ""}`}>
              <a href="#"> View Profile</a>
              <a href="#"> Change Password</a>
              <div className="dropdown-divider"></div>
              <a className="logout" onClick={handleLogout}>
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
