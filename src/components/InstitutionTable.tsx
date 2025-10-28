import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileDown } from "lucide-react";
import { generateInstitutionReport } from "@/utils/pdfGenerator";

interface InstitutionTableProps {
  institutions: any[];
  onEdit: (institution: any) => void;
  onDelete: (id: string) => void;
}

export function InstitutionTable({ institutions, onEdit, onDelete }: InstitutionTableProps) {
  if (institutions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No institutions found. Add your first institution to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>AISHE Code</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>NIRF Ranking</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions.map((institution) => (
            <TableRow key={institution.id}>
              <TableCell className="font-medium">{institution.name}</TableCell>
              <TableCell>{institution.aishe_code}</TableCell>
              <TableCell>{institution.address}</TableCell>
              <TableCell>{institution.nirf_ranking || "N/A"}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => generateInstitutionReport(institution)}
                  title="Download NIRF Snapshot"
                >
                  <FileDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(institution)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(institution.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
