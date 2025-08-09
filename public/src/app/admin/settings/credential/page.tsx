"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentTypesManager from "@/components/admin/settings/credential/DocumentTypesManager";
import FileSizeManager from "@/components/admin/settings/credential/FileSizeManager";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
            type === "delete" ? "bg-red-500" : "bg-[#26D871]"
          } shadow-xl z-100`}
        >
          <div className="flex gap-3 items-center w-[320px] h-[55px] bg-gray-50 rounded-[5px] border-white px-3 py-2">
            <div>
              {type === "delete" ? (
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
              <p className="font-semibold text-[14px]">{type === "delete" ? "Deleted" : "Success"}</p>
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
          <p className="text-sm text-gray-600 mb-1 text-center">
            Are you sure you want to delete <span className="font-semibold text-red-600">{label}</span>?
          </p>
          <p className="text-sm text-gray-600 mb-4 text-center">This action cannot be undone.</p>
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

// --- Loading Spinner ---
function Loading() {
  return (
    <div className="flex items-center justify-center h-32">
      <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  );
}

export default function CredentialsPage() {
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [maxFileSize, setMaxFileSize] = useState<number>(5); // MB
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);

  // Fetch credentials settings
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`${API_BASE_URL}/credentials`);
        setDocTypes(res.data.documentType || []);
        setMaxFileSize(res.data.fileSize || 5);
      } catch (err) {
        setNotification({ show: true, type: "delete", message: "Failed to fetch credentials settings" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generic CRUD handler
  const handleApiCall = async (
    method: string,
    endpoint: string,
    body: any,
    successMessage: string,
    updateFn?: (data: any) => void
  ) => {
    try {
      const res = await axios({ method, url: `${API_BASE_URL}/credentials${endpoint}`, data: body });
      if (updateFn) updateFn(res.data);
      setNotification({ show: true, type: method === "delete" ? "delete" : "add", message: successMessage });
    } catch (err) {
      setNotification({ show: true, type: "delete", message: `Failed to ${successMessage.toLowerCase()}` });
    }
    setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
  };

  // Document Types Handlers
  const addType = (type: string) => {
    if (!type.trim() || docTypes.includes(type)) return;
    handleApiCall("post", "/types", { type }, "Document type added!", (data) => setDocTypes(data.documentType));
  };

  const editType = (idx: number, value: string) => {
    if (!value.trim() || docTypes.includes(value)) return;
    handleApiCall(
      "put",
      "/types",
      { oldType: docTypes[idx], newType: value },
      "Document type updated!",
      (data) => setDocTypes(data.documentType)
    );
  };

  const deleteType = (idx: number) => {
    handleApiCall("delete", "/types", { type: docTypes[idx] }, "Document type deleted!", (data) => setDocTypes(data.documentType));
  };

  // File Size Handler
  const handleFileSizeChange = (value: number) => {
    if (!isNaN(value) && value > 0) {
      handleApiCall("put", "/file-size", { fileSize: value }, "Max file size updated!", (data) => setMaxFileSize(data.fileSize));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-700" /> Credentials
        </h1>
        <p className="text-xs text-gray-600">Manage allowed document types and file size</p>
      </div>
      <Notification {...notification} onClose={() => setNotification({ show: false, type: "", message: "" })} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <DocumentTypesManager
            docTypes={docTypes}
            onAddType={addType}
            onEditType={editType}
            onDeleteType={deleteType}
            deleteIdx={deleteIdx}
            setDeleteIdx={setDeleteIdx}
          />
          <FileSizeManager maxFileSize={maxFileSize} onChangeFileSize={handleFileSizeChange} />
        </>
      )}
      <DeleteModal
        show={deleteIdx !== null}
        label={deleteIdx !== null ? docTypes[deleteIdx] : ""}
        onCancel={() => setDeleteIdx(null)}
        onConfirm={() => {
          deleteType(deleteIdx!);
          setDeleteIdx(null);
        }}
      />
    </div>
  );
}