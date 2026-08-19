"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  {
    section: "Research",
    items: [
      { href: "/", label: "Dashboard", icon: DashboardIcon },
      { href: "/discover", label: "Discover", icon: SearchIcon },
      { href: "/research", label: "Deep Research", icon: ResearchIcon },
    ],
  },
  {
    section: "Database",
    items: [
      { href: "/persons", label: "Persons", icon: PersonsIcon },
      { href: "/companies", label: "Companies", icon: CompaniesIcon },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? "✕" : "☰"}
      </button>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link href="/" className="sidebar-logo" onClick={() => setOpen(false)}>
          <div className="logo-icon">
            <LogoMark />
          </div>
          <span className="logo-text">
            UAE<span className="logo-accent">Intel</span>
          </span>
        </Link>

        {NAV_ITEMS.map((group) => (
          <div key={group.section} className="sidebar-section">
            <div className="sidebar-label">{group.section}</div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="icon" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        <div className="sidebar-section">
          <div className="sidebar-label">System</div>
          <a
            href="https://github.com/ioepethi/UAE-Intel"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <GithubIcon className="icon" />
            GitHub Repo
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-link" style={{ cursor: "default" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Public business data only
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

/* Icons — inline SVG to avoid extra dependencies */
function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ResearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function PersonsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CompaniesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4v18" />
      <path d="M19 21V11l-6-4" />
      <path d="M9 9v.01" />
      <path d="M9 12v.01" />
      <path d="M9 15v.01" />
      <path d="M9 18v.01" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.66 1.05-.79 1.65S9.09 17.5 9 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/* Logo mark — a radar/lens representing intelligence & discovery */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" width="20" height="20">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      {/* Outer radar ring */}
      <circle cx="16" cy="16" r="13" stroke="url(#logo-grad)" strokeWidth="2" opacity="0.4" />
      {/* Inner ring */}
      <circle cx="16" cy="16" r="8" stroke="url(#logo-grad)" strokeWidth="2" opacity="0.7" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="3" fill="url(#logo-grad)" />
      {/* Radar sweep */}
      <path d="M16 16 L16 3 A13 13 0 0 1 27.26 9.5 Z" fill="url(#logo-grad)" opacity="0.25" />
    </svg>
  );
}
