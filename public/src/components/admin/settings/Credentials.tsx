import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Notification ---
function Notification({ show, type, message, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, x: 500 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 500 }}
          transition={{ type: "spring", stiffness: 900, damping: 25, duration: 0.2 }}
          className={`fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] ${type === 'delete' ? 'bg-red-500' : 'bg-[#26D871]'} shadow-xl z-100`}
        >
          <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
            <div>
              {type === 'delete' ? (
                <Trash2 width={23} height={23} className="text-red-500" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  fill="#26D871"
                  className="bi bi-check-square-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-semibold text-[14px]">{type === 'delete' ? 'Deleted' : 'Success'}</p>
              <p className="text-[12px]">{message}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Delete Confirmation Modal ---
function DeleteModal({ show, onCancel, onConfirm, label }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full animate-fade-in">
        <div className="flex flex-col items-center">
          <Trash2 className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Delete?</h3>
          <p className="text-sm text-gray-600 mb-1 text-center">Are you sure you want to delete <span className="font-semibold text-red-600">{label}</span>?</p>
          <p className="text-sm text-gray-600 mb-4 text-center">This action cannot be undone.</p>
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium cursor-pointer"
            >Cancel</button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium cursor-pointer shadow"
            >Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Credentials() {
  // Reference values
  const defaultTypes = ["PDF", "JPG", "PNG", "DOCX"];
  const [docTypes, setDocTypes] = useState<string[]>(defaultTypes);
  const [maxFileSize, setMaxFileSize] = useState<number>(5); // MB
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // --- Document Types Handlers ---
  const [newType, setNewType] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  const addType = () => {
    if (!newType.trim() || docTypes.includes(newType)) return;
    setDocTypes([...docTypes, newType]);
    setNewType("");
    setNotification({ show: true, type: 'add', message: 'Document type added!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const editType = (idx: number, value: string) => {
    if (!value.trim() || docTypes.includes(value)) return;
    const updated = [...docTypes];
    updated[idx] = value;
    setDocTypes(updated);
    setEditingIdx(null);
    setNotification({ show: true, type: 'edit', message: 'Document type updated!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const deleteType = (idx: number) => {
    setDocTypes(docTypes.filter((_, i) => i !== idx));
    setNotification({ show: true, type: 'delete', message: 'Document type deleted!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // --- File Size Handler ---
  const handleFileSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setMaxFileSize(value);
      setNotification({ show: true, type: 'edit', message: 'Max file size updated!' });
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };

  return (
    <div className="relative">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" /> Credentials
        </h1>
        <p className="text-xs text-gray-600">Manage allowed document types and file size</p>
      </div>
      <Notification {...notification} onClose={() => setNotification({ show: false, type: '', message: '' })} />
      {/* Allowed Document Types */}
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
              onChange={e => setNewType(e.target.value)}
              placeholder="e.g., PDF"
              className="mt-1 text-xs"
            />
          </div>
          <Button
            onClick={addType}
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
                    onChange={e => setEditValue(e.target.value)}
                    className="text-xs mr-2"
                  />
                  <Button
                    onClick={() => editType(idx, editValue)}
                    disabled={!editValue.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setEditingIdx(null)}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                  >Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-900">{type}</span>
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => { setEditingIdx(idx); setEditValue(type); }}
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
        <DeleteModal
          show={deleteIdx !== null}
          label={deleteIdx !== null ? docTypes[deleteIdx] : ""}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={() => { deleteType(deleteIdx!); setDeleteIdx(null); }}
        />
      </div>
      {/* File Size */}
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
            onChange={handleFileSizeChange}
            className="w-24 text-xs"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Recommended: 5MB. Only positive numbers allowed.</p>
      </div>
    </div>
  );
}
