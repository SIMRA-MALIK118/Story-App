"use client";

export default function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mobile-root">
      <div className="mobile-shell">
        <div className="mobile-content">
          {children}
        </div>
      </div>
    </div>
  );
}
