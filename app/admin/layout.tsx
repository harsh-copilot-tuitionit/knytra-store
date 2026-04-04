import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags,
  Settings,
} from "lucide-react";
import styles from "./adminLayout.module.css";
import React from "react";
import AdminGuard from "@/components/AdminGuard";
import LogoutButton from "@/components/LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>KNYTRA Admin</h2>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navLink}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className={styles.navLink}>
            <Package size={20} />
            <span>Products</span>
          </Link>
          <Link href="/admin/orders" className={styles.navLink}>
            <ShoppingCart size={20} />
            <span>Orders</span>
          </Link>
          <Link href="/admin/customers" className={styles.navLink}>
            <Users size={20} />
            <span>Customers</span>
          </Link>
          <Link href="/admin/discounts" className={styles.navLink}>
            <Tags size={20} />
            <span>Discounts</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/admin/settings" className={styles.navLink}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
          <LogoutButton className={styles.logoutButton} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerSpacer} />
          <div className={styles.adminProfile}>Admin User</div>
        </header>
        <div className={styles.contentPadder}>
          {children}
        </div>
      </main>
    </div>
    </AdminGuard>
  );
}
