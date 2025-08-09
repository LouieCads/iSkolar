"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Cog, Wallet, Network, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CrudManager from "@/components/admin/settings/token-payment/CrudManager";
import GeneralSettingsManager from "@/components/admin/settings/token-payment/GeneralSettingsManager";

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

// --- Segmented Control ---
const TABS = [
  { id: "general", label: "General", icon: Cog, color: "blue-600" },
  { id: "tokens", label: "Tokens", icon: Wallet, color: "blue-600" },
  { id: "merchants", label: "Merchants", icon: Wallet, color: "blue-600" },
  { id: "networks", label: "Networks", icon: Network, color: "blue-600" },
];

export default function TokenAndPaymentPage() {
  const [details, setDetails] = useState({
    supportedTokens: [],
    merchants: [],
    supportedBlockchainNetworks: [],
    minimumDeposit: 0,
    maximumWithdrawal: 0,
    paymentType: "Fiat",
  });
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });
  const [error, setError] = useState("");
  const [deleteIdx, setDeleteIdx] = useState({ tokens: null, merchants: null, networks: null });

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/token-payment/token-payment-details`);
        setDetails(data);
      } catch {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Generic CRUD handler
  const handleCrud = async (action: string, endpoint: string, payload: any, successMessage: string) => {
    setLoading(true);
    try {
      let response;
      if (action === "delete") {
        response = await axios.delete(`${API_BASE_URL}/token-payment/${endpoint}`, { data: payload });
      } else {
        response = await axios[action](`${API_BASE_URL}/token-payment/${endpoint}`, payload);
      }
      setDetails(response.data);
      setNotification({ show: true, type: action === "delete" ? "delete" : "add", message: successMessage });
    } catch (err: any) {
      setError(err?.response?.data?.message || `Failed to ${successMessage.toLowerCase()}`);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification({ show: false, type: "", message: "" }), 3000);
    }
  };

  // Handlers for each tab
  const addItem = (type: string, value: string) => {
    const endpointMap = {
      tokens: "supported-tokens",
      merchants: "merchants",
      networks: "blockchain-networks",
    };
    const payloadMap = {
      tokens: { token: value },
      merchants: { merchant: value },
      networks: { network: value },
    };
    handleCrud("post", endpointMap[type], payloadMap[type], `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} added!`);
  };

  const editItem = (type: string, idx: number, value: string) => {
    const endpointMap = {
      tokens: "supported-tokens",
      merchants: "merchants",
      networks: "blockchain-networks",
    };
    const payloadMap = {
      tokens: { oldToken: details.supportedTokens[idx], newToken: value },
      merchants: { oldMerchant: details.merchants[idx], newMerchant: value },
      networks: { oldNetwork: details.supportedBlockchainNetworks[idx], newNetwork: value },
    };
    handleCrud("put", endpointMap[type], payloadMap[type], `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} updated!`);
  };

  const deleteItem = (type: string, idx: number) => {
    const endpointMap = {
      tokens: "supported-tokens",
      merchants: "merchants",
      networks: "blockchain-networks",
    };
    const payloadMap = {
      tokens: { token: details.supportedTokens[idx] },
      merchants: { merchant: details.merchants[idx] },
      networks: { network: details.supportedBlockchainNetworks[idx] },
    };
    handleCrud("delete", endpointMap[type], payloadMap[type], `${type.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())} deleted!`);
  };

  const saveGeneralSettings = (settings: any) => {
    handleCrud("put", "general-settings", settings, "Settings updated!");
  };

  // Get items based on tab
  const getItems = (type: string) => {
    switch (type) {
      case "tokens":
        return details.supportedTokens;
      case "merchants":
        return details.merchants;
      case "networks":
        return details.supportedBlockchainNetworks;
      default:
        return [];
    }
  };

  // Render section based on tab
  let section = null;
  if (tab === "general") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <GeneralSettingsManager settings={details} onSave={saveGeneralSettings} />
      </div>
    );
  } else {
    const tabConfig = TABS.find((t) => t.id === tab);
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <CrudManager
          items={getItems(tab)}
          onAdd={(value) => addItem(tab, value)}
          onEdit={(idx, value) => editItem(tab, idx, value)}
          onDelete={(idx) => deleteItem(tab, idx)}
          itemName={tabConfig?.label || tab.replace(/^\w/, (c) => c.toUpperCase())}
          itemLabel={tab.slice(0, -1).replace(/^\w/, (c) => c.toUpperCase())}
          icon={tabConfig?.icon}
          deleteIdx={deleteIdx[tab]}
          setDeleteIdx={(idx) => setDeleteIdx({ ...deleteIdx, [tab]: idx })}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900">Token & Payment</h1>
        <p className="text-xs text-gray-600">Manage supported tokens, merchants, and payment settings.</p>
      </div>
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
      <Notification {...notification} onClose={() => setNotification({ show: false, type: "", message: "" })} />
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded shadow text-xs z-50">
          {error}
        </div>
      )}
      {loading ? <p>Loading...</p> : section}
      {tab !== "general" && (
        <DeleteModal
          show={deleteIdx[tab] !== null}
          label={deleteIdx[tab] !== null ? getItems(tab)[deleteIdx[tab]] : ""}
          onCancel={() => setDeleteIdx({ ...deleteIdx, [tab]: null })}
          onConfirm={() => {
            deleteItem(tab, deleteIdx[tab]!);
            setDeleteIdx({ ...deleteIdx, [tab]: null });
          }}
        />
      )}
    </div>
  );
}