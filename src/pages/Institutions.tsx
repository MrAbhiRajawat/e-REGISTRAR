import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InstitutionDialog } from "@/components/InstitutionDialog";
import { InstitutionTable } from "@/components/InstitutionTable";
import { SmartSearch } from "@/components/SmartSearch";
import { useToast } from "@/hooks/use-toast";

export default function Institutions() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = institutions.filter(
        (inst) =>
          inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inst.aishe_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInstitutions(filtered);
    } else {
      setFilteredInstitutions(institutions);
    }
  }, [searchTerm, institutions]);

  const fetchInstitutions = async () => {
    const { data, error } = await supabase
      .from("institutions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInstitutions(data || []);
      setFilteredInstitutions(data || []);
    }
  };

  const handleSmartSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Parse "below X" or "less than X" or "under X"
    const belowMatch = lowerQuery.match(/(?:below|less than|under)\s+(\d+)/);
    if (belowMatch) {
      const threshold = parseInt(belowMatch[1]);
      const filtered = institutions.filter(
        (inst) => inst.nirf_ranking && inst.nirf_ranking < threshold
      );
      setFilteredInstitutions(filtered);
      toast({
        title: "Smart Search Applied",
        description: `Showing institutions with NIRF ranking below ${threshold}`,
      });
      return;
    }

    // Parse "above X" or "more than X" or "over X"
    const aboveMatch = lowerQuery.match(/(?:above|more than|over)\s+(\d+)/);
    if (aboveMatch) {
      const threshold = parseInt(aboveMatch[1]);
      const filtered = institutions.filter(
        (inst) => inst.nirf_ranking && inst.nirf_ranking > threshold
      );
      setFilteredInstitutions(filtered);
      toast({
        title: "Smart Search Applied",
        description: `Showing institutions with NIRF ranking above ${threshold}`,
      });
      return;
    }

    // Default text search
    const filtered = institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(lowerQuery) ||
        inst.aishe_code.toLowerCase().includes(lowerQuery) ||
        inst.address.toLowerCase().includes(lowerQuery)
    );
    setFilteredInstitutions(filtered);
  };

  const handleEdit = (institution: any) => {
    setEditingInstitution(institution);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("institutions").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Institution deleted successfully",
      });
      fetchInstitutions();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingInstitution(null);
    fetchInstitutions();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Institutions</h1>
            <p className="text-muted-foreground">
              Manage educational institutions and their data
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Institution
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SmartSearch onSearch={handleSmartSearch} />
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or AISHE code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Institutions List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InstitutionTable
              institutions={filteredInstitutions}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        <InstitutionDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          institution={editingInstitution}
        />
      </div>
    </Layout>
  );
}
