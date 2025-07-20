import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, Award, Target, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Tabs ---
const TABS = [
  { id: "types", label: "Types", icon: Award },
  { id: "purposes", label: "Purposes", icon: Target },
  // { id: "criteria", label: "Criteria Tags", icon: Tag }, // Uncomment to enable
];

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

// --- Scholarship Types ---
function ScholarshipTypeManager({ types, onAdd, onEdit, onDelete }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newType, setNewType] = useState("");
  const [editValue, setEditValue] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Award className="w-3 h-3 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Scholarship Types</h3>
      </div>
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end">
        <div className="flex-1">
            <Label className="text-xs font-medium text-gray-700">Type Name</Label>
            <Input
            value={newType}
            onChange={e => setNewType(e.target.value)}
              placeholder="e.g., Merit-based"
              className="mt-1 text-xs"
            />
        </div>
        <Button
          onClick={() => { onAdd(newType); setNewType(""); }}
          disabled={!newType.trim()}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
        >
          <Plus className="w-2 h-2" /> Add Type
        </Button>
      </div>
      <div className="space-y-1">
        {types.map((type, idx) => (
          <div key={type} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIndex === idx ? (
              <>
                    <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                  <Button
                  onClick={() => { onEdit(idx, editValue); setEditingIndex(null); }}
                  disabled={!editValue.trim()}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                  onClick={() => setEditingIndex(null)}
                  className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                >Cancel</Button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-900">{type}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => { setEditingIndex(idx); setEditValue(type); }}
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
        label={deleteIdx !== null ? types[deleteIdx] : ""}
        onCancel={() => setDeleteIdx(null)}
        onConfirm={() => { onDelete(deleteIdx); setDeleteIdx(null); }}
      />
    </div>
  );
}

// --- Scholarship Purposes ---
function ScholarshipPurposeManager({ purposes, onAdd, onEdit, onDelete }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newPurpose, setNewPurpose] = useState("");
  const [editValue, setEditValue] = useState("");
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Target className="w-3 h-3 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">Scholarship Purposes</h3>
      </div>
      <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end">
        <div className="flex-1">
            <Label className="text-xs font-medium text-gray-700">Purpose Name</Label>
            <Input
            value={newPurpose}
            onChange={e => setNewPurpose(e.target.value)}
              placeholder="e.g., Tuition"
              className="mt-1 text-xs"
            />
        </div>
        <Button
          onClick={() => { onAdd(newPurpose); setNewPurpose(""); }}
          disabled={!newPurpose.trim()}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
        >
          <Plus className="w-2 h-2" /> Add Purpose
        </Button>
      </div>
      <div className="space-y-1">
        {purposes.map((purpose, idx) => (
          <div key={purpose} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
            {editingIndex === idx ? (
              <>
                    <Input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                  <Button
                  onClick={() => { onEdit(idx, editValue); setEditingIndex(null); }}
                  disabled={!editValue.trim()}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                  onClick={() => setEditingIndex(null)}
                  className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                >Cancel</Button>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-gray-900">{purpose}</span>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => { setEditingIndex(idx); setEditValue(purpose); }}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Purpose"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Purpose"
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
        label={deleteIdx !== null ? purposes[deleteIdx] : ""}
        onCancel={() => setDeleteIdx(null)}
        onConfirm={() => { onDelete(deleteIdx); setDeleteIdx(null); }}
      />
    </div>
  );
}

// --- Criteria Tags (commented out for now) ---
/*
function CriteriaTagsManager({ tags, onAdd, onEdit, onDelete }) {
  // ...criteria tags component code here...
}
*/

export function ScholarshipDetails() {
  const [types, setTypes] = useState<string[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  // const [criteriaTags, setCriteriaTags] = useState<string[]>([]); // For future use
  const [tab, setTab] = useState("types");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [error, setError] = useState("");

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/scholarship-details/scholarship-details`);
        setTypes(data.types || []);
        setPurposes(data.purposes || []);
        // setCriteriaTags(data.criteriaTags || []); // For future use
      } catch {
        setTypes(["Merit-based", "Skill-based"]);
        setPurposes(["Tuition", "Allowance"]);
        // setCriteriaTags([]); // For future use
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- CRUD handlers for types ---
  const addType = async (type: string) => {
    if (!type.trim() || types.includes(type)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/scholarship-types`, { type });
      setTypes(data.types);
      setNotification({ show: true, type: 'add', message: 'Type added!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add type");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };
  const editType = async (idx: number, newType: string) => {
    if (!newType.trim() || types.includes(newType)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/scholarship-types`, {
        oldType: types[idx],
        newType,
      });
      setTypes(data.types);
      setNotification({ show: true, type: 'edit', message: 'Type updated!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update type");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };
  const deleteType = async (idx: number) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/scholarship-types`, {
        data: { type: types[idx] },
      });
      setTypes(data.types);
      setNotification({ show: true, type: 'delete', message: 'Type deleted!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete type");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };

  // --- CRUD handlers for purposes ---
  const addPurpose = async (purpose: string) => {
    if (!purpose.trim() || purposes.includes(purpose)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, { purpose });
      setPurposes(data.purposes);
      setNotification({ show: true, type: 'add', message: 'Purpose added!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add purpose");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };
  const editPurpose = async (idx: number, newPurpose: string) => {
    if (!newPurpose.trim() || purposes.includes(newPurpose)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, {
        oldPurpose: purposes[idx],
        newPurpose,
      });
      setPurposes(data.purposes);
      setNotification({ show: true, type: 'edit', message: 'Purpose updated!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update purpose");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };
  const deletePurpose = async (idx: number) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, {
        data: { purpose: purposes[idx] },
      });
      setPurposes(data.purposes);
      setNotification({ show: true, type: 'delete', message: 'Purpose deleted!' });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete purpose");
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
    }
  };

  // --- CRUD handlers for criteria tags (commented out for now) ---
  /*
  const addTag = async (tag: string) => { ... };
  const editTag = async (idx: number, newTag: string) => { ... };
  const deleteTag = async (idx: number) => { ... };
  */

  // --- Rendered Section ---
  let section = null;
  if (tab === "types") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <ScholarshipTypeManager types={types} onAdd={addType} onEdit={editType} onDelete={deleteType} />
      </div>
    );
  } else if (tab === "purposes") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <ScholarshipPurposeManager purposes={purposes} onAdd={addPurpose} onEdit={editPurpose} onDelete={deletePurpose} />
      </div>
    );
  /*
  } else if (tab === "criteria") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <CriteriaTagsManager tags={criteriaTags} onAdd={addTag} onEdit={editTag} onDelete={deleteTag} />
      </div>
    );
  */
  }

  return (
    <div className="relative">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900">Scholarship Details</h1>
        <p className="text-xs text-gray-600">Manage scholarship types and purposes</p>
      </div>
      {/* Segmented Control */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border transition-colors duration-150 ${
              tab === id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      <Notification {...notification} onClose={() => setNotification({ show: false, type: '', message: '' })} />
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded shadow text-xs z-50">{error}</div>
      )}
      {section}
    </div>
  );
}
