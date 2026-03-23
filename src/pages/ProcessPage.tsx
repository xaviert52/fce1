import Navbar from "@/components/layout/Navbar";
import CertificateWizard from "@/components/process/CertificateWizard";

const ProcessPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <CertificateWizard />
    </div>
  );
};

export default ProcessPage;
