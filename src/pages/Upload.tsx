import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload as UploadIcon, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"academic" | "kpi">("academic");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      data.push(obj);
    }

    return data;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (uploadType === "academic") {
        // Upload academic records
        const records = data.map((row) => ({
          student_id: row.student_id,
          course_name: row.course_name,
          grade: row.grade,
          year: parseInt(row.year),
          project_details: row.project_details || null,
        }));

        const { error } = await supabase.from("academic_records").insert(records);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${records.length} academic records uploaded successfully`,
        });
      } else {
        // Upload institutional KPIs
        const kpis = data.map((row) => ({
          institution_id: row.institution_id,
          year: parseInt(row.year),
          student_faculty_ratio: parseFloat(row.student_faculty_ratio),
          research_papers_published: parseInt(row.research_papers_published),
        }));

        const { error } = await supabase.from("institutional_kpis").insert(kpis);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${kpis.length} KPI records uploaded successfully`,
        });
      }

      setFile(null);
      const inputElement = document.getElementById("file-upload") as HTMLInputElement;
      if (inputElement) inputElement.value = "";
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Upload CSV files to add academic records and institutional KPIs in bulk
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Academic Records
              </CardTitle>
              <CardDescription>
                Upload student academic achievements and course completions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setUploadType("academic")}
              >
                Select Academic Records
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-secondary" />
                Institutional KPIs
              </CardTitle>
              <CardDescription>
                Upload key performance indicators for institutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setUploadType("kpi")}
              >
                Select KPI Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Currently uploading: <span className="font-semibold">{uploadType === "academic" ? "Academic Records" : "Institutional KPIs"}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                {uploadType === "academic" ? (
                  <div>
                    <strong>Required CSV columns:</strong>
                    <br />
                    student_id, course_name, grade, year, project_details (optional)
                  </div>
                ) : (
                  <div>
                    <strong>Required CSV columns:</strong>
                    <br />
                    institution_id, year, student_faculty_ratio, research_papers_published
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Select CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full"
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Data"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
