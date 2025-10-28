import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SmartSearchProps {
  onSearch: (query: string) => void;
}

export function SmartSearch({ onSearch }: SmartSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Sparkles className="absolute left-3 top-3 h-4 w-4 text-secondary" />
        <Input
          placeholder="Try: 'show institutions with nirf ranking below 100'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <Button type="submit" variant="secondary">
        Search
      </Button>
    </form>
  );
}
