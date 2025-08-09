import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface FileSizeManagerProps {
  maxFileSize: number;
  onChangeFileSize: (value: number) => void;
}

export default function FileSizeManager({ maxFileSize, onChangeFileSize }: FileSizeManagerProps) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <FileText className="w-4 h-4 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">File Size</h3>
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs font-medium text-gray-700">Max File Size (MB)</Label>
        <Input
          type="number"
          min={1}
          value={maxFileSize}
          onChange={(e) => onChangeFileSize(parseInt(e.target.value, 10))}
          className="w-24 text-xs"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">Recommended: 5MB. Only positive numbers allowed.</p>
    </div>
  );
}