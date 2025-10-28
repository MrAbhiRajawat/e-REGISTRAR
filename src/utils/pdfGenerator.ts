import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export async function generateInstitutionReport(institution: any) {
  try {
    // Fetch latest KPIs for the institution
    const { data: kpis } = await supabase
      .from("institutional_kpis")
      .select("*")
      .eq("institution_id", institution.id)
      .order("year", { ascending: false })
      .limit(1);

    // Fetch student count
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("institution_id", institution.id);

    // Create PDF
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 100);
    doc.text("Edu-Unify NIRF Snapshot", 105, 20, { align: "center" });
    
    // Institution Name
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(institution.name, 20, 40);
    
    // Details
    doc.setFontSize(12);
    doc.text(`AISHE Code: ${institution.aishe_code}`, 20, 55);
    doc.text(`Address: ${institution.address}`, 20, 65);
    doc.text(`NIRF Ranking: ${institution.nirf_ranking || "Not Ranked"}`, 20, 75);
    
    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 85, 190, 85);
    
    // KPI Section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Key Performance Indicators", 20, 100);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    if (kpis && kpis.length > 0) {
      const latestKPI = kpis[0];
      doc.text(`Year: ${latestKPI.year}`, 20, 115);
      doc.text(`Student-Faculty Ratio: ${latestKPI.student_faculty_ratio}`, 20, 125);
      doc.text(`Research Papers Published: ${latestKPI.research_papers_published}`, 20, 135);
      
      // Risk Assessment
      const isHighRisk = latestKPI.student_faculty_ratio > 20;
      doc.setTextColor(isHighRisk ? 220 : 0, isHighRisk ? 38 : 150, isHighRisk ? 38 : 0);
      doc.text(
        `NIRF Risk Status: ${isHighRisk ? "High Risk" : "Low Risk"}`,
        20,
        145
      );
    } else {
      doc.setTextColor(100, 100, 100);
      doc.text("No KPI data available", 20, 115);
    }
    
    // Student Count
    doc.setTextColor(0, 0, 0);
    doc.line(20, 155, 190, 155);
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 100);
    doc.text("Student Statistics", 20, 170);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Students: ${studentCount || 0}`, 20, 185);
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} via Edu-Unify Platform`,
      105,
      280,
      { align: "center" }
    );
    
    // Save the PDF
    doc.save(`${institution.aishe_code}_NIRF_Snapshot.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}
