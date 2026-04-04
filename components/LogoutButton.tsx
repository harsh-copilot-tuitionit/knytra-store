"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.replace("/admin/login");
  }

  return (
    <button className={className} onClick={handleLogout}>
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
}
