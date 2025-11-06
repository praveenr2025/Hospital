"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Settings, ChevronDown, ClipboardList, Users, Calendar, LayoutDashboard } from "lucide-react"; // SVG icons
import { fetchUserProfile } from "@/utils/auth"; // helper to fetch /auth/user

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; role?: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile?.user) setUser(profile.user);
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("hospitalToken");
    router.push("/hospital");
  };

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        {/* Left Section - Logo + Title */}
        <div className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Hospital Admin Portal
            </h1>
            <p className="text-sm text-gray-500">
              Operations & Staff Management
            </p>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="flex space-x-5">
          <Link
            href="/admin/dashboard"
            className={`flex items-center space-x-1 nav-link ${
              pathname === "/admin/dashboard"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/admin/staff"
            className={`flex items-center space-x-1 ${
              pathname === "/admin/staff"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff</span>
          </Link>

          <Link
            href="/admin/roster"
            className={`flex items-center space-x-1 ${
              pathname === "/admin/roster"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Roster</span>
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center space-x-1 ${
              pathname === "/admin/users"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Users</span>
          </Link>

          <Link
            href="/admin/settings"
            className={`flex items-center space-x-1 ${
              pathname === "/admin/settings"
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </nav>

        {/* Right Section - User Profile */}
        <div className="relative user-profile">
          <button
            className={`flex items-center space-x-3 focus:outline-none ${
              dropdownOpen ? "text-blue-600" : "text-gray-700"
            }`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-700 font-bold rounded-full">
              {initials}
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">
                {user?.full_name || "Loading..."}
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {user?.role || "staff"}
              </div>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <Link
                href="/admin/profile"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <User className="w-4 h-4 mr-2" /> View Profile
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-2" /> Change Password
              </Link>
              <div className="border-t my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
