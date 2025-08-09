import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, Tag } from "lucide-react";

export default function CriteriaTagsManager({ criteriaTags, onAdd, onEdit, onDelete, DeleteModal }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [newCriteriaTag, setNewCriteriaTag] = useState("");
  const [editValue, setEditValue] = useState("");
  const [deleteIdx, setDeleteIdx] = useState(null);

  const handleAdd = () => {
    onAdd(newCriteriaTag);
    setNewCriteriaTag("");
  };

  const handleEdit = () => {
    onEdit(editingIndex, editValue);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDelete = () => {
    onDelete(deleteIdx);
    setDeleteIdx(null);
  };

  const startEdit = (idx, value) => {
    setEditingIndex(idx);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5 mb-2">
        <Tag className="w-3 h-3 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Criteria Tags</h3>
      </div>

      {/* Add New Criteria Tag Form */}
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end">
        <div className="flex-1">
          <Label className="text-xs font-medium text-gray-700">Criteria Tag Name</Label>
          <Input
            value={newCriteriaTag}
            onChange={(e) => setNewCriteriaTag(e.target.value)}
            className="mt-1 text-xs"
            onKeyPress={(e) => e.key === 'Enter' && newCriteriaTag.trim() && handleAdd()}
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newCriteriaTag.trim()}
          className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
        >
          <Plus className="w-2 h-2 mr-1" /> Add Tag
        </Button>
      </div>

      {/* Criteria Tags List */}
      <div className="space-y-1">
        {criteriaTags.map((criteriaTag, idx) => (
          <div key={criteriaTag} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIndex === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                  onKeyPress={(e) => e.key === 'Enter' && editValue.trim() && handleEdit()}
                />
                <div className="flex gap-1">
                  <Button
                    onClick={handleEdit}
                    disabled={!editValue.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-900">{criteriaTag}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => startEdit(idx, criteriaTag)}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Criteria Tag"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Criteria Tag"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {criteriaTags.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No criteria tags added yet</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {DeleteModal && (
        <DeleteModal
          show={deleteIdx !== null}
          label={deleteIdx !== null ? criteriaTags[deleteIdx] : ""}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}