"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import styles from "./CareersAdminShell.module.css";

const PUBLIC_PATHS = ["/careers/admin/login", "/careers/admin/setup"];

interface AdminInfo {
  uid: string;
  name: string;
  role: string;
}

interface CareersAdminContextValue {
  admin: AdminInfo | null;
  loading: boolean;
}

const CareersAdminContext = createContext<CareersAdminContextValue>({
  admin: null,
  loading: true,
});

export const useCareersAdmin = () => useContext(CareersAdminContext);

export default function CareersAdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const res = await fetch("/api/careers/admin/verify");
        if (res.ok) {
          const data = await res.json();
          if (active) setAdmin(data.admin);
        } else if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace("/careers/admin/login");
        }
      } catch {
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace("/careers/admin/login");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void verify();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/careers/admin/logout", { method: "POST" });
    } finally {
      router.replace("/careers/admin/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  // Public pages — render without shell
  if (PUBLIC_PATHS.includes(pathname)) {
    return (
      <CareersAdminContext.Provider value={{ admin, loading }}>
        {children}
      </CareersAdminContext.Provider>
    );
  }

  // Not authenticated
  if (!admin) return null;

  const NAV = [
    { href: "/careers/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/careers/admin/applications",
      label: "Applications",
      icon: Users,
    },
    { href: "/careers/admin/jobs", label: "Job Postings", icon: Briefcase },
  ];

  return (
    <CareersAdminContext.Provider value={{ admin, loading }}>
      <div className={styles.adminContainer}>
        {isNavOpen ? (
          <button
            className={styles.mobileBackdrop}
            type="button"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <aside className={`${styles.sidebar} ${isNavOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <h2>KNYTRA Recruit</h2>
            <button
              type="button"
              className={styles.mobileClose}
              onClick={() => setIsNavOpen(false)}
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>
          </div>

          <nav className={styles.sidebarNav}>
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ""}`}
                onClick={() => setIsNavOpen(false)}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            <Link
              href="/careers/admin/setup"
              className={`${styles.navLink} ${pathname === "/careers/admin/setup" ? styles.navLinkActive : ""}`}
              onClick={() => setIsNavOpen(false)}
            >
              <UserPlus size={20} />
              <span>Add Recruiter</span>
            </Link>
            <button
              className={styles.logoutBtn}
              onClick={() => void handleLogout()}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className={styles.mainContent}>
          <header className={styles.topHeader}>
            <div className={styles.mobileHeaderRow}>
              <button
                type="button"
                className={styles.hamburgerBtn}
                onClick={() => setIsNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <span className={styles.mobileHeaderTitle}>Recruiter Dashboard</span>
            </div>
            <div className={styles.adminProfile}>
              {admin.name} ({admin.role})
            </div>
          </header>
          <div className={styles.contentPadder}>{children}</div>
        </div>
      </div>
    </CareersAdminContext.Provider>
  );
}
