import * as React from "react";
import { ChecklistWizard } from "@/components/ChecklistWizard";
import { TechnicianInbox } from "@/components/technician/TechnicianInbox";
import { useAuth } from "@/contexts/AuthContext";
import { useChecklist } from "@/contexts/ChecklistContext";
import { Helmet } from "react-helmet";
import { SiteAssignment } from "@/lib/assignmentDatabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Inbox } from "lucide-react";

const Index = () => {
  const { isTecnico, isGestor, isAdmin } = useAuth();
  const { updateData, setCurrentStep, setCurrentGabinete } = useChecklist();
  const [activeTab, setActiveTab] = React.useState<string>("inbox");
  const [selectedAssignment, setSelectedAssignment] = React.useState<SiteAssignment | null>(null);

  // Handle starting checklist from assignment
  const handleStartChecklist = (assignment: SiteAssignment) => {
    if (assignment.site) {
      // Pre-fill site data
      updateData('siglaSite', assignment.site.site_code);
      updateData('uf', assignment.site.uf as any);
      
      // Store assignment ID for later linking
      sessionStorage.setItem('currentAssignmentId', assignment.id);
      
      // Switch to checklist tab and start from beginning
      setCurrentStep(0);
      setCurrentGabinete(0);
      setSelectedAssignment(assignment);
      setActiveTab("checklist");
    }
  };

  // For technicians, show inbox + checklist tabs
  // For gestors/admins, show checklist directly (they can access inbox via /atribuicoes)
  const showTechnicianView = isTecnico && !isGestor && !isAdmin;

  if (showTechnicianView) {
    return (
      <>
        <Helmet>
          <title>Checklist Sites Telecom | Vivo</title>
          <meta name="description" content="Aplicativo de checklist para inspeção de sites e gabinetes de telecomunicações." />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          <meta name="theme-color" content="#005DAA" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </Helmet>
        
        <div className="min-h-screen bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="sticky top-0 z-40 bg-card border-b">
              <TabsList className="w-full justify-start rounded-none h-12 p-0 bg-transparent">
                <TabsTrigger 
                  value="inbox" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  <Inbox className="w-4 h-4 mr-2" />
                  Minhas Vistorias
                </TabsTrigger>
                <TabsTrigger 
                  value="checklist"
                  className="flex-1 h-full rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Checklist
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="inbox" className="mt-0 p-4">
              <TechnicianInbox onStartChecklist={handleStartChecklist} />
            </TabsContent>
            
            <TabsContent value="checklist" className="mt-0">
              <ChecklistWizard />
            </TabsContent>
          </Tabs>
        </div>
      </>
    );
  }

  // Default view for gestors/admins
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
