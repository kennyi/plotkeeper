// Auth pages sit above the main layout via a fixed full-screen overlay.
// This avoids restructuring the app route tree while keeping the login
// page clean and sidebar-free.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50">
      {children}
    </div>
  );
}
