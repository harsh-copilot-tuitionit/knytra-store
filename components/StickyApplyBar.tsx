import Link from "next/link";
import styles from "./StickyApplyBar.module.css";

interface Props {
  href: string;
  label?: string;
}

export default function StickyApplyBar({ href, label }: Props) {
  return (
    <div className={styles.stickyApplyBar}>
      <span className={styles.stickyLabel}>
        {label ?? "Applying for HR + Growth Intern"}
      </span>
      <Link href={href} className={styles.stickyButton}>
        Start My Application
      </Link>
    </div>
  );
}
