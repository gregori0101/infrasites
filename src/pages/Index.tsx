import { ChecklistWizard } from "@/components/ChecklistWizard";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Checklist Sites Telecom | Vivo</title>
        <meta name="description" content="Aplicativo de checklist para inspeção de sites e gabinetes de telecomunicações. Capture fotos, valide dados e gere relatórios PDF/Excel." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#005DAA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>
      <ChecklistWizard />
    </>
  );
};

export default Index;
