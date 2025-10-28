import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Award, Calendar } from "lucide-react";

export default function StudentLifecycle() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchStudentData();
    }
  }, [id]);

  const fetchStudentData = async () => {
    // Fetch student info
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*, institutions(name)")
      .eq("id", id)
      .single();

    if (studentError) {
      toast({
        title: "Error",
        description: studentError.message,
        variant: "destructive",
      });
      return;
    }

    setStudent(studentData);

    // Fetch academic records
    const { data: academicData } = await supabase
      .from("academic_records")
      .select("*")
      .eq("student_id", id)
      .order("year", { ascending: true });

    // Fetch scheme participation
    const { data: schemeData } = await supabase
      .from("scheme_participation")
      .select("*")
      .eq("student_id", id)
      .order("date", { ascending: true });

    // Combine and sort timeline
    const timelineEvents = [
      ...(academicData || []).map((record) => ({
        type: "academic",
        date: new Date(record.year, 0, 1),
        title: record.course_name,
        description: `Grade: ${record.grade}`,
        details: record.project_details,
        icon: BookOpen,
      })),
      ...(schemeData || []).map((scheme) => ({
        type: "scheme",
        date: new Date(scheme.date),
        title: scheme.scheme_name,
        description: "Government Scheme Participation",
        icon: Award,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    setTimeline(timelineEvents);
  };

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-12 text-muted-foreground">
          Loading student data...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Student Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{student.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Aadhaar ID</p>
                <p className="font-mono">{student.aadhaar_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">APAR ID</p>
                <p className="font-mono">{student.apar_id}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Institution</p>
              <p>{student.institutions?.name || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Student Lifecycle Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No timeline events available for this student.
              </p>
            ) : (
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-secondary before:to-accent">
                {timeline.map((event, index) => (
                  <div key={index} className="relative flex items-start gap-6 group">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border-2 border-primary shadow-lg group-hover:scale-110 transition-transform">
                      <event.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Card className="flex-1 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant={event.type === "academic" ? "default" : "secondary"}>
                            {event.type === "academic" ? "Academic" : "Scheme"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.date.toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: event.type === "scheme" ? "numeric" : undefined,
                          })}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm">{event.description}</p>
                        {event.details && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.details}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
