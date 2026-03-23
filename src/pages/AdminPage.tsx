import Navbar from "@/components/layout/Navbar";
import AdminDashboard from "@/components/admin/AdminDashboard";

const AdminPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <AdminDashboard />
    </div>
  );
};

export default AdminPage;
