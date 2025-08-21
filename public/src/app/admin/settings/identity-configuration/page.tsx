"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Settings, UserSquare, Briefcase, Wallet, Building2, Factory, School, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ListTab from "@/components/admin/settings/identity-configuration/ListTab";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Field mapping - ensures consistency between frontend and backend
const FIELD_MAPPING = {
  idTypes: {
    key: "idTypes",
    endpoint: "id-types",
    label: "ID Types"
  },
  employmentType: {
    key: "employmentType", 
    endpoint: "employment-type",
    label: "Employment Type"
  },
  natureOfWork: {
    key: "natureOfWork",
    endpoint: "nature-of-work", 
    label: "Nature of Work"
  },
  sourceOfIncome: {
    key: "sourceOfIncome",
    endpoint: "source-of-income",
    label: "Source of Income"
  },
  organizationType: {
    key: "organizationType",
    endpoint: "organization-type",
    label: "Organization Type"
  },
  industrySector: {
    key: "industrySector",
    endpoint: "industry-sector",
    label: "Industry Sector"
  },
  schoolType: {
    key: "schoolType",
    endpoint: "school-type",
    label: "School Type"
  }
};

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

// --- Delete Confirmation Modal ---
function DeleteModal({ show, onCancel, onConfirm, label }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full"
      >
        <div className="flex flex-col items-center">
          <Trash2 className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Item?</h3>
          <p className="text-sm text-gray-600 mb-1 text-center">
            Are you sure you want to delete <span className="font-semibold text-red-600">"{label}"</span>?
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
      </motion.div>
    </div>
  );
}

// --- Tab Configuration ---
const TABS = [
  { key: "idTypes", label: "ID Types", icon: UserSquare, color: "blue-600" },
  { key: "employmentType", label: "Employment Type", icon: Briefcase, color: "blue-600" },
  { key: "natureOfWork", label: "Nature of Work", icon: Building2, color: "blue-600" },
  { key: "sourceOfIncome", label: "Source of Income", icon: Wallet, color: "blue-600" },
  { key: "organizationType", label: "Organization Type", icon: Building2, color: "blue-600" },
  { key: "industrySector", label: "Industry Sector", icon: Factory, color: "blue-600" },
  { key: "schoolType", label: "School Type", icon: School, color: "blue-600" },
];

export default function KycKybConfigurationPage() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // State for all data types
  const [data, setData] = useState({
    idTypes: [],
    employmentType: [],
    natureOfWork: [],
    sourceOfIncome: [],
    organizationType: [],
    industrySector: [],
    schoolType: []
  });

  const [deleteModal, setDeleteModal] = useState({
    show: false,
    field: null,
    index: null,
    item: ""
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${API_BASE_URL}/identity-configuration/all`);
        const responseData = response.data;
        
        setData({
          idTypes: responseData.idTypes || [],
          employmentType: responseData.employmentType || [],
          natureOfWork: responseData.natureOfWork || [],
          sourceOfIncome: responseData.sourceOfIncome || [],
          organizationType: responseData.organizationType || [],
          industrySector: responseData.industrySector || [],
          schoolType: responseData.schoolType || []
        });
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch configuration data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Show notification
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: "", message: "" });
    }, 3000);
  };

  // Generic API handler with better error handling
  const handleApiCall = async (method, field, payload, successMessage) => {
    setLoading(true);
    setError("");
    
    const fieldConfig = FIELD_MAPPING[field];
    if (!fieldConfig) {
      setError(`Invalid field: ${field}`);
      setLoading(false);
      return;
    }

    try {
      const url = `${API_BASE_URL}/identity-configuration/${fieldConfig.endpoint}`;
      console.log(`${method.toUpperCase()} request to:`, url);
      console.log("Payload:", payload);

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("API Response:", response.data);

      // Update local state with fresh data
      setData({
        idTypes: response.data.idTypes || [],
        employmentType: response.data.employmentType || [],
        natureOfWork: response.data.natureOfWork || [],
        sourceOfIncome: response.data.sourceOfIncome || [],
        organizationType: response.data.organizationType || [],
        industrySector: response.data.industrySector || [],
        schoolType: response.data.schoolType || []
      });

      showNotification(method === "delete" ? "delete" : "success", successMessage);
    } catch (err) {
      console.error("API Error:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          `Failed to ${method} ${fieldConfig.label.toLowerCase()}`;
      setError(errorMessage);
      showNotification("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add item handler
  const handleAddItem = (field, item) => {
    const trimmedItem = item.trim();
    if (!trimmedItem) {
      setError("Item cannot be empty");
      return;
    }

    // Check for duplicates
    if (data[field].includes(trimmedItem)) {
      setError("Item already exists");
      return;
    }

    const fieldConfig = FIELD_MAPPING[field];
    handleApiCall(
      "post", 
      field, 
      { item: trimmedItem }, 
      `${fieldConfig.label} added successfully!`
    );
  };

  // Edit item handler
  const handleEditItem = (field, index, newItem) => {
    const trimmedItem = newItem.trim();
    if (!trimmedItem) {
      setError("Item cannot be empty");
      return;
    }

    const currentItems = data[field];
    if (index < 0 || index >= currentItems.length) {
      setError("Invalid item index");
      return;
    }

    const oldItem = currentItems[index];
    if (oldItem === trimmedItem) {
      return; // No change
    }

    // Check for duplicates (excluding current item)
    if (currentItems.includes(trimmedItem)) {
      setError("Item already exists");
      return;
    }

    const fieldConfig = FIELD_MAPPING[field];
    handleApiCall(
      "put", 
      field, 
      { oldItem, newItem: trimmedItem }, 
      `${fieldConfig.label} updated successfully!`
    );
  };

  // Show delete confirmation
  const showDeleteConfirmation = (field, index) => {
    const currentItems = data[field];
    if (index < 0 || index >= currentItems.length) {
      setError("Invalid item index");
      return;
    }

    setDeleteModal({
      show: true,
      field,
      index,
      item: currentItems[index]
    });
  };

  // Confirm delete
  const confirmDelete = () => {
    const { field, index, item } = deleteModal;
    const fieldConfig = FIELD_MAPPING[field];
    
    console.log(`Deleting item: "${item}" from field: ${field}`);
    
    handleApiCall(
      "delete", 
      field, 
      { item }, 
      `${fieldConfig.label} deleted successfully!`
    );
    
    setDeleteModal({ show: false, field: null, index: null, item: "" });
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal({ show: false, field: null, index: null, item: "" });
  };

  // Get current tab configuration
  const getCurrentTabConfig = () => {
    const fieldConfig = FIELD_MAPPING[activeTab];
    return {
      title: fieldConfig.label,
      items: data[activeTab] || [],
      icon: TABS.find(t => t.key === activeTab)?.icon
    };
  };

  const currentConfig = getCurrentTabConfig();

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-700" /> 
          Identity Configuration
        </h1>
        <p className="text-xs text-gray-600">
          Manage Identity 
        </p>
      </div>

      {/* Notifications */}
      <Notification 
        {...notification} 
        onClose={() => setNotification({ show: false, type: "", message: "" })} 
      />

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError("")}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border transition-colors duration-150 ${
              activeTab === key
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {loading ? (
          <Loading />
        ) : (
          <ListTab
            title={currentConfig.title}
            items={currentConfig.items}
            onAddItem={(item) => handleAddItem(activeTab, item)}
            onEditItem={(idx, newItem) => handleEditItem(activeTab, idx, newItem)}
            onDeleteItem={(idx) => showDeleteConfirmation(activeTab, idx)}
            icon={currentConfig.icon}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        show={deleteModal.show}
        label={deleteModal.item}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}