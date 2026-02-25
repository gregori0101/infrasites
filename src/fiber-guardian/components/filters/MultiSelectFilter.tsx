import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelectFilter({ label, options, selected, onChange, placeholder = "Selecionar...", className }: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = selected.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full justify-between h-10", className)}>
          <span className="truncate flex-1 text-left">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selected.length === 1 ? selectedLabels[0] : `${selected.length} selecionados`}
          </span>
          <div className="flex items-center gap-1 ml-2">
            {selected.length > 0 && <X className="h-4 w-4 opacity-50 hover:opacity-100" onClick={handleClear} />}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-popover" align="start">
        <div className="p-2 border-b"><span className="text-sm font-medium">{label}</span></div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer">
              <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => handleToggle(option.value)} />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full" onClick={() => { onChange([]); setOpen(false); }}>Limpar seleção</Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
