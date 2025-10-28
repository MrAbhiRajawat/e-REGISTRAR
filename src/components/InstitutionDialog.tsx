import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InstitutionDialogProps {
  open: boolean;
  onClose: () => void;
  institution?: any;
}

export function InstitutionDialog({ open, onClose, institution }: InstitutionDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    aishe_code: "",
    address: "",
    nirf_ranking: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name,
        aishe_code: institution.aishe_code,
        address: institution.address,
        nirf_ranking: institution.nirf_ranking?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        aishe_code: "",
        address: "",
        nirf_ranking: "",
      });
    }
  }, [institution, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = {
      ...formData,
      nirf_ranking: formData.nirf_ranking ? parseInt(formData.nirf_ranking) : null,
    };

    let error;
    if (institution) {
      ({ error } = await supabase
        .from("institutions")
        .update(dataToSubmit)
        .eq("id", institution.id));
    } else {
      ({ error } = await supabase.from("institutions").insert([dataToSubmit]));
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: institution
          ? "Institution updated successfully"
          : "Institution created successfully",
      });
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {institution ? "Edit Institution" : "Add Institution"}
          </DialogTitle>
          <DialogDescription>
            {institution
              ? "Update the institution details"
              : "Add a new educational institution"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institution Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aishe_code">AISHE Code</Label>
            <Input
              id="aishe_code"
              value={formData.aishe_code}
              onChange={(e) => setFormData({ ...formData, aishe_code: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nirf_ranking">NIRF Ranking (Optional)</Label>
            <Input
              id="nirf_ranking"
              type="number"
              value={formData.nirf_ranking}
              onChange={(e) => setFormData({ ...formData, nirf_ranking: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
