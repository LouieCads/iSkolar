import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Settings,
  UserSquare,
  Briefcase,
  Wallet,
  Building2,
  Factory,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Notification Component (from Credentials) ---
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
          <h3 className="text-lg font-bold text-gray-900 mb-1">Delete?</h3>
          <p className="text-sm text-gray-600 mb-1 text-center">
            Are you sure you want to delete{" "}
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
      </motion.div>
    </div>
  );
}

// --- Tab Navigation ---
const TABS = [
  { key: "idTypes", label: "ID Types", icon: UserSquare },
  { key: "employmentType", label: "Employment Type", icon: Briefcase },
  { key: "natureOfWork", label: "Nature of Work", icon: Building2 },
  { key: "sourceOfIncome", label: "Source of Income", icon: Wallet },
  { key: "organizationType", label: "Organization Type", icon: Building2 },
  { key: "industrySector", label: "Industry Sector", icon: Factory },
];

// --- Tab Content Components ---
function ListTab({
  title,
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  placeholder,
  notification,
  setNotification,
}) {
  const [newItem, setNewItem] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteIdx, setDeleteIdx] = useState(null);

  const handleAddItem = () => {
    if (!newItem.trim() || items.includes(newItem)) return;
    onAddItem(newItem);
    setNewItem("");
  };

  const handleEditItem = (idx, value) => {
    if (!value.trim() || items.includes(value)) return;
    onEditItem(idx, value);
    setEditingIdx(null);
  };

  const handleDeleteItem = (idx) => {
    onDeleteItem(idx);
    setDeleteIdx(null);
  };

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-blue-700" />
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex gap-2 items-end mb-3">
        <div className="flex-1">
          <Label className="text-xs font-medium text-gray-700">{placeholder}</Label>
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={placeholder}
            className="mt-1 text-xs"
          />
        </div>
        <Button
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="px-2 py-1 bg-green-600 text-white rounded text-xs"
        >
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div
            key={item + idx}
            className="bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between"
          >
            {editingIdx === idx ? (
              <>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="text-xs mr-2"
                />
                <Button
                  onClick={() => handleEditItem(idx, editValue)}
                  disabled={!editValue.trim()}
                  className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                >
                  <Save className="w-3 h-3" />
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
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => setDeleteIdx(idx)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Delete Modal */}
      <DeleteModal
        show={deleteIdx !== null}
        label={deleteIdx !== null ? items[deleteIdx] : ""}
        onCancel={() => setDeleteIdx(null)}
        onConfirm={() => handleDeleteItem(deleteIdx)}
      />
    </div>
  );
}

// --- Main KYC/KYB Configuration Component ---
export function KycKybConfiguration() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [idTypes, setIdTypes] = useState([]);
  const [employmentType, setEmploymentType] = useState([]);
  const [natureOfWork, setNatureOfWork] = useState([]);
  const [sourceOfIncome, setSourceOfIncome] = useState([]);
  const [organizationType, setOrganizationType] = useState([]);
  const [industrySector, setIndustrySector] = useState([]);

  // --- Fetch initial data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/kyc-kyb-configuration/kyc-kyb-configuration`
        );
        setIdTypes(data.idTypes || []);
        setEmploymentType(data.employmentType || []);
        setNatureOfWork(data.natureOfWork || []);
        setSourceOfIncome(data.sourceOfIncome || []);
        setOrganizationType(data.organizationType || []);
        setIndustrySector(data.industrySector || []);
      } catch (err) {
        setError("Failed to fetch configuration data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Generic CRUD handlers ---
  const handleApiCall = async (
    method,
    endpoint,
    body,
    stateUpdater,
    successMessage
  ) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios({ method, url: `${API_BASE_URL}/kyc-kyb-configuration${endpoint}`, data: body });
      if (data) {
        setIdTypes(data.idTypes || []);
        setEmploymentType(data.employmentType || []);
        setNatureOfWork(data.natureOfWork || []);
        setSourceOfIncome(data.sourceOfIncome || []);
        setOrganizationType(data.organizationType || []);
        setIndustrySector(data.industrySector || []);
      }
      setNotification({ show: true, type: "success", message: successMessage });
    } catch (err) {
      setError(err?.response?.data?.message || `Operation failed: ${successMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    }
  };

  const addItem = (field, item, stateUpdater) => handleApiCall("post", `/${field}`, { item }, stateUpdater, `${field.replace("-", " ")} added!`);
  const editItem = (field, oldItem, newItem, stateUpdater) => handleApiCall("put", `/${field}`, { oldItem, newItem }, stateUpdater, `${field.replace("-", " ")} updated!`);
  const deleteItem = (field, item, stateUpdater) => handleApiCall("delete", `/${field}`, { item }, stateUpdater, `${field.replace("-", " ")} deleted!`);

  const tabContent = {
    idTypes: (
      <ListTab
        title="ID Types"
        items={idTypes}
        onAddItem={(item) => addItem("id-types", item, setIdTypes)}
        onEditItem={(idx, newItem) => editItem("id-types", idTypes[idx], newItem, setIdTypes)}
        onDeleteItem={(idx) => deleteItem("id-types", idTypes[idx], setIdTypes)}
        placeholder="e.g., UMID, Passport"
        notification={notification}
        setNotification={setNotification}
      />
    ),
    employmentType: (
      <ListTab
        title="Employment Type"
        items={employmentType}
        onAddItem={(item) => addItem("employment-type", item, setEmploymentType)}
        onEditItem={(idx, newItem) => editItem("employment-type", employmentType[idx], newItem, setEmploymentType)}
        onDeleteItem={(idx) => deleteItem("employment-type", employmentType[idx], setEmploymentType)}
        placeholder="e.g., Full-time, Part-time"
        notification={notification}
        setNotification={setNotification}
      />
    ),
    natureOfWork: (
      <ListTab
        title="Nature of Work"
        items={natureOfWork}
        onAddItem={(item) => addItem("nature-of-work", item, setNatureOfWork)}
        onEditItem={(idx, newItem) => editItem("nature-of-work", natureOfWork[idx], newItem, setNatureOfWork)}
        onDeleteItem={(idx) => deleteItem("nature-of-work", natureOfWork[idx], setNatureOfWork)}
        placeholder="e.g., Employed, Self-Employed"
        notification={notification}
        setNotification={setNotification}
      />
    ),
    sourceOfIncome: (
      <ListTab
        title="Source of Income"
        items={sourceOfIncome}
        onAddItem={(item) => addItem("source-of-income", item, setSourceOfIncome)}
        onEditItem={(idx, newItem) => editItem("source-of-income", sourceOfIncome[idx], newItem, setSourceOfIncome)}
        onDeleteItem={(idx) => deleteItem("source-of-income", sourceOfIncome[idx], setSourceOfIncome)}
        placeholder="e.g., Salary, Business"
        notification={notification}
        setNotification={setNotification}
      />
    ),
    organizationType: (
      <ListTab
        title="Organization Type"
        items={organizationType}
        onAddItem={(item) => addItem("organization-type", item, setOrganizationType)}
        onEditItem={(idx, newItem) => editItem("organization-type", organizationType[idx], newItem, setOrganizationType)}
        onDeleteItem={(idx) => deleteItem("organization-type", organizationType[idx], setOrganizationType)}
        placeholder="e.g., Corporation, NGO"
        notification={notification}
        setNotification={setNotification}
      />
    ),
    industrySector: (
      <ListTab
        title="Industry Sector"
        items={industrySector}
        onAddItem={(item) => addItem("industry-sector", item, setIndustrySector)}
        onEditItem={(idx, newItem) => editItem("industry-sector", industrySector[idx], newItem, setIndustrySector)}
        onDeleteItem={(idx) => deleteItem("industry-sector", industrySector[idx], setIndustrySector)}
        placeholder="e.g., Technology, Healthcare"
        notification={notification}
        setNotification={setNotification}
      />
    ),
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-700" /> KYC/KYB Configuration
        </h1>
        <p className="text-xs text-gray-600">
          Manage KYC/KYB required fields, ID types, and more for all roles
        </p>
      </div>
      <Notification
        {...notification}
        onClose={() => setNotification({ show: false, type: "", message: "" })}
      />
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {/* Segmented Control Tab Navigation */}
      <div className="flex gap-2 mb-5">
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
      <div>{loading ? <Loading /> : tabContent[activeTab]}</div>
    </div>
  );
}
