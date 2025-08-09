import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save } from "lucide-react";

interface TabSectionProps {
  type: string;
  items: string[];
  newItem: string;
  setNewItem: (value: string) => void;
  editingIdx: number | null;
  setEditingIdx: (idx: number | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  deleteIdx: number | null;
  setDeleteIdx: (idx: number | null) => void;
  addItem: () => void;
  editItem: (idx: number, value: string) => void;
  loading: boolean;
  tabConfig: { id: string; label: string; icon: any; color: string } | undefined;
}

export default function TabSection({
  type,
  items,
  newItem,
  setNewItem,
  editingIdx,
  setEditingIdx,
  editValue,
  setEditValue,
  deleteIdx,
  setDeleteIdx,
  addItem,
  editItem,
  loading,
  tabConfig,
}: TabSectionProps) {
  const Icon = tabConfig?.icon;
  const title = tabConfig?.label || type.replace(/^\w/, (c) => c.toUpperCase());
  const color = tabConfig?.color || "blue-600";

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && <Icon className={`w-4 h-4 text-${color}`} />}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end mb-2">
        <div className="flex-1">
          <Label className="text-xs font-medium text-gray-700">
            {type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} Name
          </Label>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="mt-1 text-xs"
          />
        </div>
        <Button
          onClick={addItem}
          disabled={!newItem.trim() || loading}
          className={`px-2 py-1 bg-${color} text-white rounded text-xs`}
        >
          {loading ? "Adding..." : <Plus className="w-2 h-2" />} Add {type.slice(0, -1)}
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={item} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIdx === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                <Button
                  onClick={() => editItem(idx, editValue)}
                  disabled={!editValue.trim() || loading}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                >
                  {loading ? "Updating..." : <Save className="w-2.5 h-2.5" />}
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
                <span className="text-xs font-medium text-gray-900">{item}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => {
                      setEditingIdx(idx);
                      setEditValue(item);
                    }}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title={`Edit ${type.slice(0, -1)}`}
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title={`Delete ${type.slice(0, -1)}`}
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