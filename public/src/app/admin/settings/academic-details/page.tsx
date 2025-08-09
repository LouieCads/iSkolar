"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, BookOpen, Layers, School, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TabSection from "@/components/admin/settings/academic-details/TabSection";

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
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
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

// --- Segmented Control ---
const TABS = [
  { id: "courses", label: "Course List", icon: BookOpen, color: "green-600" },
  { id: "semesters", label: "Semesters", icon: Calendar, color: "orange-600" },
  { id: "years", label: "Year Levels", icon: Layers, color: "purple-600" },
  { id: "schools", label: "Schools", icon: School, color: "blue-600" },
];

export default function AcademicDetailsPage() {
  // State
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Section-specific state
  const [newItem, setNewItem] = useState({ courses: "", semesters: "", years: "", schools: "" });
  const [editingIdx, setEditingIdx] = useState({ courses: null, semesters: null, years: null, schools: null });
  const [editValue, setEditValue] = useState({ courses: "", semesters: "", years: "", schools: "" });
  const [deleteIdx, setDeleteIdx] = useState({ courses: null, semesters: null, years: null, schools: null });

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/academic-details/academic-details`);
        console.log("Initial fetch data:", data); // Debug log
        setCourses(data.course || data.courses || []);
        setSemesters(data.semester || data.semesters || []);
        setYears(data.yearLevel || data.years || data.yearLevels || []);
        setSchools(data.school || data.schools || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Fallback data
        setCourses(["BSCS", "BSECE", "BSBA", "BSIT", "BSA", "BSN", "BSED", "BSEE", "BSME", "BSTM"]);
        setSemesters(["1st Semester", "2nd Semester", "Summer"]);
        setYears(["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Master's"]);
        setSchools([
          "University of the Philippines",
          "Ateneo de Manila University",
          "De La Salle University",
          "Mapua University",
          "Far Eastern University",
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generic handlers with improved error handling and state management
  const addItem = async (type: string) => {
    const value = newItem[type].trim();
    const items = getItems(type);
    
    if (!value || items.includes(value)) {
      setError(items.includes(value) ? `${type.slice(0, -1)} already exists` : "Please enter a valid value");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/academic-details/${type}`, { 
        [type.slice(0, -1)]: value 
      });
      
      console.log("Add response:", response.data); // Debug log
      
      // Handle different possible response structures
      const updatedItems = response.data[type] || 
                          response.data[type.slice(0, -1)] || 
                          response.data.data?.[type] ||
                          [...items, value]; // Fallback: add to current items
      
      setItems(type, updatedItems);
      setNotification({ 
        show: true, 
        type: "add", 
        message: `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} added successfully!` 
      });
      setNewItem({ ...newItem, [type]: "" });
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("Add error:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          `Failed to add ${type.slice(0, -1)}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        setError("");
      }, 3000);
    }
  };

  const editItem = async (type: string, idx: number, value: string) => {
    const trimmedValue = value.trim();
    const items = getItems(type);
    
    if (!trimmedValue || items.includes(trimmedValue)) {
      setError(items.includes(trimmedValue) ? `${type.slice(0, -1)} already exists` : "Please enter a valid value");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const oldValue = items[idx];
      const response = await axios.put(`${API_BASE_URL}/academic-details/${type}`, {
        [`old${type.charAt(0).toUpperCase() + type.slice(1, -1)}`]: oldValue,
        [`new${type.charAt(0).toUpperCase() + type.slice(1, -1)}`]: trimmedValue,
      });
      
      console.log("Edit response:", response.data); // Debug log
      
      // Handle different possible response structures
      const updatedItems = response.data[type] || 
                          response.data[type.slice(0, -1)] || 
                          response.data.data?.[type] ||
                          items.map((item, i) => i === idx ? trimmedValue : item); // Fallback
      
      setItems(type, updatedItems);
      setNotification({ 
        show: true, 
        type: "edit", 
        message: `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} updated successfully!` 
      });
      setEditingIdx({ ...editingIdx, [type]: null });
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("Edit error:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          `Failed to update ${type.slice(0, -1)}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        setError("");
      }, 3000);
    }
  };

  const deleteItem = async (type: string, idx: number) => {
    const items = getItems(type);
    const itemToDelete = items[idx];
    
    setLoading(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/academic-details/${type}`, {
        data: { [type.slice(0, -1)]: itemToDelete },
      });
      
      console.log("Delete response:", response.data); // Debug log
      
      // Handle different possible response structures
      const updatedItems = response.data[type] || 
                          response.data[type.slice(0, -1)] || 
                          response.data.data?.[type] ||
                          items.filter((_, i) => i !== idx); // Fallback
      
      setItems(type, updatedItems);
      setNotification({ 
        show: true, 
        type: "delete", 
        message: `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} deleted successfully!` 
      });
      setError(""); // Clear any previous errors
    } catch (err: any) {
      console.error("Delete error:", err);
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.error || 
                          `Failed to delete ${type.slice(0, -1)}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setNotification({ show: false, type: "", message: "" });
        setError("");
      }, 3000);
    }
  };

  // Helper to get items based on type
  const getItems = (type: string): string[] => {
    switch (type) {
      case "courses": return courses || [];
      case "semesters": return semesters || [];
      case "years": return years || [];
      case "schools": return schools || [];
      default: return [];
    }
  };

  // Helper to set items based on type
  const setItems = (type: string, items: string[]) => {
    console.log(`Setting ${type}:`, items); // Debug log
    switch (type) {
      case "courses": 
        setCourses(Array.isArray(items) ? items : []); 
        break;
      case "semesters": 
        setSemesters(Array.isArray(items) ? items : []); 
        break;
      case "years": 
        setYears(Array.isArray(items) ? items : []); 
        break;
      case "schools": 
        setSchools(Array.isArray(items) ? items : []); 
        break;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-700" /> Academic Details
        </h1>
        <p className="text-xs text-gray-600">Manage course list, semesters, year levels, and universities/schools</p>
      </div>
      
      {/* Segmented Control */}
      <div className="flex gap-2 mb-5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-medium border transition-colors duration-150 ${
              tab === id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
      
      <Notification 
        {...notification} 
        onClose={() => setNotification({ show: false, type: "", message: "" })} 
      />
      
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded shadow text-xs z-50">
          {error}
        </div>
      )}
      
      <TabSection
        type={tab}
        items={getItems(tab)}
        newItem={newItem[tab]}
        setNewItem={(value) => setNewItem({ ...newItem, [tab]: value })}
        editingIdx={editingIdx[tab]}
        setEditingIdx={(idx) => setEditingIdx({ ...editingIdx, [tab]: idx })}
        editValue={editValue[tab]}
        setEditValue={(value) => setEditValue({ ...editValue, [tab]: value })}
        deleteIdx={deleteIdx[tab]}
        setDeleteIdx={(idx) => setDeleteIdx({ ...deleteIdx, [tab]: idx })}
        addItem={() => addItem(tab)}
        editItem={(idx, value) => editItem(tab, idx, value)}
        loading={loading}
        tabConfig={TABS.find((t) => t.id === tab)}
      />
      
      <DeleteModal
        show={deleteIdx[tab] !== null}
        label={deleteIdx[tab] !== null ? getItems(tab)[deleteIdx[tab]] : ""}
        onCancel={() => setDeleteIdx({ ...deleteIdx, [tab]: null })}
        onConfirm={() => {
          if (deleteIdx[tab] !== null) {
            deleteItem(tab, deleteIdx[tab]);
            setDeleteIdx({ ...deleteIdx, [tab]: null });
          }
        }}
      />
    </div>
  );
}