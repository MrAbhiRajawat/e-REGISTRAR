import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [stats, setStats] = useState({
    institutions: 0,
    students: 0,
    academicRecords: 0,
  });
  const [riskInstitutions, setRiskInstitutions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [instCount, studCount, acadCount] = await Promise.all([
      supabase.from("institutions").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("academic_records").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      institutions: instCount.count || 0,
      students: studCount.count || 0,
      academicRecords: acadCount.count || 0,
    });

    // Fetch risk analysis
    const { data: kpis } = await supabase
      .from("institutional_kpis")
      .select("*, institutions(name)")
      .order("year", { ascending: false });

    if (kpis) {
      const latestKPIs = kpis.reduce((acc: any, kpi: any) => {
        if (!acc[kpi.institution_id] || kpi.year > acc[kpi.institution_id].year) {
          acc[kpi.institution_id] = kpi;
        }
        return acc;
      }, {});

      const atRisk = Object.values(latestKPIs).filter(
        (kpi: any) => kpi.student_faculty_ratio > 20
      );

      setRiskInstitutions(atRisk);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of educational institutions and student data
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.institutions}</div>
              <p className="text-xs text-muted-foreground">Registered institutions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Records</CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.academicRecords}</div>
              <p className="text-xs text-muted-foreground">Total academic achievements</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Institutional Insights</CardTitle>
            </div>
            <CardDescription>
              Predictive analytics for NIRF ranking risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {riskInstitutions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No institutional KPI data available yet. Upload data to see insights.
              </p>
            ) : (
              <div className="space-y-3">
                {riskInstitutions.map((inst: any) => (
                  <div
                    key={inst.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium">{inst.institutions?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Student-Faculty Ratio: {inst.student_faculty_ratio}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive">High Risk</Badge>
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
