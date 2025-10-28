import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StudentTable } from "@/components/StudentTable";
import { SmartSearch } from "@/components/SmartSearch";
import { useToast } from "@/hooks/use-toast";

export default function Students() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.aadhaar_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.apar_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*, institutions(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStudents(data || []);
      setFilteredStudents(data || []);
    }
  };

  const handleSmartSearch = async (query: string) => {
    const lowerQuery = query.toLowerCase();
    
    // Parse scheme participation queries
    const schemeMatch = lowerQuery.match(/(?:in|participated|part of)\s+(.+)/);
    if (schemeMatch) {
      const schemeName = schemeMatch[1].trim();
      
      const { data: participations } = await supabase
        .from("scheme_participation")
        .select("student_id")
        .ilike("scheme_name", `%${schemeName}%`);

      if (participations) {
        const studentIds = participations.map((p) => p.student_id);
        const filtered = students.filter((s) => studentIds.includes(s.id));
        setFilteredStudents(filtered);
        toast({
          title: "Smart Search Applied",
          description: `Showing students in scheme: ${schemeName}`,
        });
        return;
      }
    }

    // Default text search
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.aadhaar_id.toLowerCase().includes(lowerQuery) ||
        student.apar_id.toLowerCase().includes(lowerQuery)
    );
    setFilteredStudents(filtered);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">
            Browse and search student records
          </p>
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
                placeholder="Search by name, Aadhaar ID, or APAR ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentTable students={filteredStudents} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
