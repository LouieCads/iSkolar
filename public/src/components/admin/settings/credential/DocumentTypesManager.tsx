import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, FileText } from "lucide-react";

interface DocumentTypesManagerProps {
  docTypes: string[];
  onAddType: (type: string) => void;
  onEditType: (idx: number, value: string) => void;
  onDeleteType: (idx: number) => void;
  deleteIdx: number | null;
  setDeleteIdx: (idx: number | null) => void;
}

export default function DocumentTypesManager({
  docTypes,
  onAddType,
  onEditType,
  onDeleteType,
  deleteIdx,
  setDeleteIdx,
}: DocumentTypesManagerProps) {
  const [newType, setNewType] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3 mb-6">
      <div className="flex items-center gap-1.5 mb-2">
        <FileText className="w-4 h-4 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">Allowed Document Types</h3>
      </div>
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end mb-2">
        <div className="flex-1">
          <Label className="text-xs font-medium text-gray-700">Document Type</Label>
          <Input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="mt-1 text-xs"
          />
        </div>
        <Button
          onClick={() => {
            onAddType(newType);
            setNewType("");
          }}
          disabled={!newType.trim()}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
        >
          <Plus className="w-2 h-2" /> Add Type
        </Button>
      </div>
      <div className="space-y-1">
        {docTypes.map((type, idx) => (
          <div key={type} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIdx === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                <Button
                  onClick={() => {
                    onEditType(idx, editValue);
                    setEditingIdx(null);
                  }}
                  disabled={!editValue.trim()}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                >
                  <Save className="w-2.5 h-2.5" />
                </Button>
                <Button
                  onClick={() => setEditingIdx(null)}
                  className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-900">{type}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => {
                      setEditingIdx(idx);
                      setEditValue(type);
                    }}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Type"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Type"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}