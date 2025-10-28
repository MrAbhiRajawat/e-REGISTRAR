import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface StudentTableProps {
  students: any[];
}

export function StudentTable({ students }: StudentTableProps) {
  const navigate = useNavigate();

  if (students.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No students found. Use the bulk upload feature to add student data.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Aadhaar ID</TableHead>
            <TableHead>APAR ID</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell>{student.aadhaar_id}</TableCell>
              <TableCell>{student.apar_id}</TableCell>
              <TableCell>{student.institutions?.name || "N/A"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/student/${student.id}`)}
                  title="View Lifecycle"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
