"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Award, Target, Tag, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScholarshipTypeManager from "@/components/admin/settings/scholarship-details/ScholarshipTypeManager";
import ScholarshipPurposeManager from "@/components/admin/settings/scholarship-details/ScholarshipPurposeManager";
import CriteriaTagsManager from "@/components/admin/settings/scholarship-details/CriteriaTagsManager";
import DocumentsManager from "@/components/admin/settings/scholarship-details/DocumentsManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Tabs Configuration ---
const TABS = [
  { id: "types", label: "Types", icon: Award },
  { id: "purposes", label: "Purposes", icon: Target },
  { id: "criteria", label: "Criteria Tags", icon: Tag },
  { id: "documents", label: "Documents", icon: FileText },
];

// --- Notification Component ---
function Notification({ show, type, message, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, x: 500 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 500 }}
          transition={{ type: "spring", stiffness: 900, damping: 25, duration: 0.2 }}
          className={`fixed w-[325px] flex justify-end items-center h-[55px] bottom-5 right-5 rounded-[10px] text-[#002828] ${
            type === 'delete' ? 'bg-red-500' : 'bg-[#26D871]'
          } shadow-xl z-100`}
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
              <p className="font-semibold text-[14px]">
                {type === 'delete' ? 'Deleted' : 'Success'}
              </p>
              <p className="text-[12px]">{message}</p>
            </div>
            <button 
              onClick={onClose} 
              className="ml-auto text-gray-400 hover:text-gray-600 text-lg font-bold"
            >
              &times;
            </button>
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
          <p className="text-sm text-gray-600 mb-1 text-center">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-red-600">{label}</span>?
          </p>
          <p className="text-sm text-gray-600 mb-4 text-center">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors font-medium cursor-pointer shadow"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScholarshipDetailsPage() {
  const [types, setTypes] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [criteriaTags, setCriteriaTags] = useState([]);
  const [documents, setDocuments] = useState([]);
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
        setCriteriaTags(data.criteriaTags || []);
        setDocuments(data.documents || []);
      } catch {
        setTypes(["Merit-based", "Skill-based"]);
        setPurposes(["Tuition", "Allowance"]);
        setCriteriaTags(["Academic Excellence", "Financial Need", "Community Service"]);
        setDocuments(["Transcript of Records", "Certificate of Enrollment", "Valid ID"]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Show notification helper
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // --- CRUD handlers for types ---
  const addType = async (type) => {
    if (!type.trim() || types.includes(type)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/scholarship-types`, { type });
      setTypes(data.types);
      showNotification('add', 'Type added!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add type");
    } finally {
      setLoading(false);
    }
  };

  const editType = async (idx, newType) => {
    if (!newType.trim() || types.includes(newType)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/scholarship-types`, {
        oldType: types[idx],
        newType,
      });
      setTypes(data.types);
      showNotification('edit', 'Type updated!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update type");
    } finally {
      setLoading(false);
    }
  };

  const deleteType = async (idx) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/scholarship-types`, {
        data: { type: types[idx] },
      });
      setTypes(data.types);
      showNotification('delete', 'Type deleted!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete type");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD handlers for purposes ---
  const addPurpose = async (purpose) => {
    if (!purpose.trim() || purposes.includes(purpose)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, { purpose });
      setPurposes(data.purposes);
      showNotification('add', 'Purpose added!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add purpose");
    } finally {
      setLoading(false);
    }
  };

  const editPurpose = async (idx, newPurpose) => {
    if (!newPurpose.trim() || purposes.includes(newPurpose)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, {
        oldPurpose: purposes[idx],
        newPurpose,
      });
      setPurposes(data.purposes);
      showNotification('edit', 'Purpose updated!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update purpose");
    } finally {
      setLoading(false);
    }
  };

  const deletePurpose = async (idx) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/scholarship-purposes`, {
        data: { purpose: purposes[idx] },
      });
      setPurposes(data.purposes);
      showNotification('delete', 'Purpose deleted!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete purpose");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD handlers for criteria tags ---
  const addCriteriaTag = async (criteriaTag) => {
    if (!criteriaTag.trim() || criteriaTags.includes(criteriaTag)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/criteria-tags`, { criteriaTag });
      setCriteriaTags(data.criteriaTags);
      showNotification('add', 'Criteria tag added!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add criteria tag");
    } finally {
      setLoading(false);
    }
  };

  const editCriteriaTag = async (idx, newCriteriaTag) => {
    if (!newCriteriaTag.trim() || criteriaTags.includes(newCriteriaTag)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/criteria-tags`, {
        oldCriteriaTag: criteriaTags[idx],
        newCriteriaTag,
      });
      setCriteriaTags(data.criteriaTags);
      showNotification('edit', 'Criteria tag updated!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update criteria tag");
    } finally {
      setLoading(false);
    }
  };

  const deleteCriteriaTag = async (idx) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/criteria-tags`, {
        data: { criteriaTag: criteriaTags[idx] },
      });
      setCriteriaTags(data.criteriaTags);
      showNotification('delete', 'Criteria tag deleted!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete criteria tag");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD handlers for documents ---
  const addDocument = async (document) => {
    if (!document.trim() || documents.includes(document)) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/scholarship-details/documents`, { document });
      setDocuments(data.documents);
      showNotification('add', 'Document added!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add document");
    } finally {
      setLoading(false);
    }
  };

  const editDocument = async (idx, newDocument) => {
    if (!newDocument.trim() || documents.includes(newDocument)) return;
    setLoading(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/scholarship-details/documents`, {
        oldDocument: documents[idx],
        newDocument,
      });
      setDocuments(data.documents);
      showNotification('edit', 'Document updated!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (idx) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/scholarship-details/documents`, {
        data: { document: documents[idx] },
      });
      setDocuments(data.documents);
      showNotification('delete', 'Document deleted!');
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete document");
    } finally {
      setLoading(false);
    }
  };

  // --- Rendered Section ---
  const renderSection = () => {
    switch (tab) {
      case "types":
        return (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <ScholarshipTypeManager 
              types={types} 
              onAdd={addType} 
              onEdit={editType} 
              onDelete={deleteType}
              DeleteModal={DeleteModal}
            />
          </div>
        );
      case "purposes":
        return (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <ScholarshipPurposeManager 
              purposes={purposes} 
              onAdd={addPurpose} 
              onEdit={editPurpose} 
              onDelete={deletePurpose}
              DeleteModal={DeleteModal}
            />
          </div>
        );
      case "criteria":
        return (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <CriteriaTagsManager 
              criteriaTags={criteriaTags} 
              onAdd={addCriteriaTag} 
              onEdit={editCriteriaTag} 
              onDelete={deleteCriteriaTag}
              DeleteModal={DeleteModal}
            />
          </div>
        );
      case "documents":
        return (
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
            <DocumentsManager 
              documents={documents} 
              onAdd={addDocument} 
              onEdit={editDocument} 
              onDelete={deleteDocument}
              DeleteModal={DeleteModal}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Scholarship Details</h1>
            <p className="text-sm text-gray-600 mt-1">Manage scholarship types, purposes, criteria tags, and required documents</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150 ${
                  tab === id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          {renderSection()}

          {/* Loading Indicator */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading...</p>
              </div>
            </div>
          )}

          {/* Notifications */}
          <Notification 
            {...notification} 
            onClose={() => setNotification({ show: false, type: '', message: '' })} 
          />

          {/* Error Message */}
          {error && (
            <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded shadow text-sm z-50 max-w-md">
              {error}
              <button 
                onClick={() => setError("")}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}