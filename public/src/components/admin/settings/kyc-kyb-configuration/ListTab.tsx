import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface ListTabProps {
  title: string;
  items: string[];
  onAddItem: (item: string) => void;
  onEditItem: (idx: number, newItem: string) => void;
  onDeleteItem: (idx: number) => void;
  icon: any;
}

export default function ListTab({
  title,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  icon: Icon,
}: ListTabProps) {
  const [newItem, setNewItem] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");

  // Handle adding new item
  const handleAddItem = () => {
    const trimmedItem = newItem.trim();
    
    if (!trimmedItem) {
      setAddError("Item cannot be empty");
      return;
    }

    if (items.includes(trimmedItem)) {
      setAddError("Item already exists");
      return;
    }

    setAddError("");
    onAddItem(trimmedItem);
    setNewItem("");
  };

  // Handle editing item
  const handleEditSubmit = (idx: number, value: string) => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setEditError("Item cannot be empty");
      return;
    }

    if (trimmedValue === items[idx]) {
      // No change, just cancel editing
      cancelEdit();
      return;
    }

    if (items.includes(trimmedValue)) {
      setEditError("Item already exists");
      return;
    }

    setEditError("");
    onEditItem(idx, trimmedValue);
    cancelEdit();
  };

  // Start editing
  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(items[idx]);
    setEditError("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingIdx(null);
    setEditValue("");
    setEditError("");
  };

  // Handle key press for add input
  const handleAddKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  // Handle key press for edit input
  const handleEditKeyPress = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit(idx, editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Clear add error when input changes
  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value);
    if (addError) setAddError("");
  };

  // Clear edit error when input changes
  const handleEditValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    if (editError) setEditError("");
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-blue-700" />
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Add New Item Section */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label className="text-xs font-medium text-blue-900 mb-1 block">
              Add New {title}
            </Label>
            <Input
              value={newItem}
              onChange={handleNewItemChange}
              onKeyPress={handleAddKeyPress}
              className={`text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                addError ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
              }`}
            />
            {addError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <X className="w-3 h-3" />
                {addError}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700">Current Items</h3>
          {items.length === 0 && (
            <span className="text-xs text-gray-400">No items added yet</span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No {title.toLowerCase()} added yet.</p>
            <p className="text-xs text-gray-400">Add your first item above to get started.</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              {editingIdx === idx ? (
                // Edit Mode
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <Input
                      value={editValue}
                      onChange={handleEditValueChange}
                      onKeyPress={(e) => handleEditKeyPress(e, idx)}
                      className={`text-sm ${
                        editError ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''
                      }`}
                      autoFocus
                    />
                    {editError && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {editError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEditSubmit(idx, editValue)}
                      disabled={!editValue.trim()}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium disabled:opacity-50 flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-900 block truncate">
                      {item}
                    </span>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <Button
                      onClick={() => startEdit(idx)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded transition-colors"
                      title={`Edit ${item}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onDeleteItem(idx)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded transition-colors"
                      title={`Delete ${item}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}