import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save } from "lucide-react";

interface CrudManagerProps {
  items: string[];
  onAdd: (value: string) => void;
  onEdit: (idx: number, value: string) => void;
  onDelete: (idx: number) => void;
  itemName: string;
  itemLabel: string;
  icon: any;
  deleteIdx: number | null;
  setDeleteIdx: (idx: number | null) => void;
}

export default function CrudManager({
  items,
  onAdd,
  onEdit,
  onDelete,
  itemName,
  itemLabel,
  icon: Icon,
  deleteIdx,
  setDeleteIdx,
}: CrudManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newItem, setNewItem] = useState("");
  const [editValue, setEditValue] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">{itemName}</h3>
      </div>
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs font-medium text-gray-700">{itemLabel}</Label>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="mt-1 text-xs"
          />
        </div>
        <Button
          onClick={() => {
            onAdd(newItem);
            setNewItem("");
          }}
          disabled={!newItem.trim()}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
        >
          <Plus className="w-2 h-2" /> Add {itemLabel}
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={item} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIndex === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                <Button
                  onClick={() => {
                    onEdit(idx, editValue);
                    setEditingIndex(null);
                  }}
                  disabled={!editValue.trim()}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                >
                  <Save className="w-2.5 h-2.5" />
                </Button>
                <Button
                  onClick={() => setEditingIndex(null)}
                  className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-900">{item}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => {
                      setEditingIndex(idx);
                      setEditValue(item);
                    }}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title={`Edit ${itemLabel}`}
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title={`Delete ${itemLabel}`}
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