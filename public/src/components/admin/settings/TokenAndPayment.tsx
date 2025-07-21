import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, Cog, Wallet, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TABS = [
    { id: "general", label: "General", icon: Cog },
    { id: "tokens", label: "Tokens", icon: Wallet },
    { id: "merchants", label: "Merchants", icon: Wallet },
    { id: "networks", label: "Networks", icon: Network },
];

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

function CrudManager({ items, onAdd, onEdit, onDelete, itemName, itemLabel, icon: Icon }) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newItem, setNewItem] = useState("");
    const [editValue, setEditValue] = useState("");
    const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon className="w-3 h-3 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">{itemName}</h3>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end">
          <div className="flex-1">
              <Label className="text-xs font-medium text-gray-700">{itemLabel}</Label>
              <Input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder={`e.g., ${itemLabel}`}
                className="mt-1 text-xs"
              />
          </div>
          <Button
            onClick={() => { onAdd(newItem); setNewItem(""); }}
            disabled={!newItem.trim()}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            <Plus className="w-2 h-2" /> Add {itemLabel}
          </Button>
        </div>
        <div className="space-y-1">
          {items.map((item, idx) => (
            <div key={item} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
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
                  <span className="text-xs font-medium text-gray-900">{item}</span>
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => { setEditingIndex(idx); setEditValue(item); }}
                      className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                      title={`Edit ${itemLabel}`}
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteIdx(idx)}
                      className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                      title={`Delete ${itemLabel}`}
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
          label={deleteIdx !== null ? items[deleteIdx] : ""}
          onCancel={() => setDeleteIdx(null)}
          onConfirm={() => { onDelete(deleteIdx); setDeleteIdx(null); }}
        />
      </div>
    );
}

function GeneralSettingsManager({ settings, onSave }) {
    const [localSettings, setLocalSettings] = useState(settings);
  
    useEffect(() => {
      setLocalSettings(settings);
    }, [settings]);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
  
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 mb-2">
            <Cog className="w-3 h-3 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">General Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label className="text-xs font-medium text-gray-700">Minimum Deposit</Label>
                <Input type="number" name="minimumDeposit" value={localSettings.minimumDeposit || ''} onChange={handleChange} className="mt-1 text-xs" />
            </div>
            <div>
                <Label className="text-xs font-medium text-gray-700">Maximum Withdrawal</Label>
                <Input type="number" name="maximumWithdrawal" value={localSettings.maximumWithdrawal || ''} onChange={handleChange} className="mt-1 text-xs" />
            </div>
        </div>
        <div className="flex justify-end">
            <Button onClick={() => onSave(localSettings)} className="px-4 py-2 bg-blue-600 text-white rounded text-xs">
                <Save className="w-3 h-3 mr-1" /> Save Changes
            </Button>
        </div>
      </div>
    );
}

export function TokenAndPayment() {
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
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });
    const [error, setError] = useState("");

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

    useEffect(() => {
        fetchData();
    }, []);

    const handleCrud = async (action, endpoint, payload, successMessage) => {
        setLoading(true);
        try {
            let response;
            if (action === 'delete') {
                response = await axios.delete(`${API_BASE_URL}/token-payment/${endpoint}`, { data: payload });
            } else {
                response = await axios[action](`${API_BASE_URL}/token-payment/${endpoint}`, payload);
            }
            setDetails(response.data);
            setNotification({ show: true, type: action === 'delete' ? 'delete' : 'add', message: successMessage });
        } catch (err: any) {
            setError(err?.response?.data?.message || `Failed to ${successMessage.toLowerCase()}`);
        } finally {
            setLoading(false);
            setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
        }
    };
    
    const addToken = (token: string) => handleCrud('post', 'supported-tokens', { token }, 'Token added!');
    const editToken = (idx: number, newToken: string) => handleCrud('put', 'supported-tokens', { oldToken: details.supportedTokens[idx], newToken }, 'Token updated!');
    const deleteToken = (idx: number) => handleCrud('delete', 'supported-tokens', { token: details.supportedTokens[idx] } , 'Token deleted!');

    const addMerchant = (merchant: string) => handleCrud('post', 'merchants', { merchant }, 'Merchant added!');
    const editMerchant = (idx: number, newMerchant: string) => handleCrud('put', 'merchants', { oldMerchant: details.merchants[idx], newMerchant }, 'Merchant updated!');
    const deleteMerchant = (idx: number) => handleCrud('delete', 'merchants', { merchant: details.merchants[idx] } , 'Merchant deleted!');

    const addNetwork = (network: string) => handleCrud('post', 'blockchain-networks', { network }, 'Network added!');
    const editNetwork = (idx: number, newNetwork: string) => handleCrud('put', 'blockchain-networks', { oldNetwork: details.supportedBlockchainNetworks[idx], newNetwork }, 'Network updated!');
    const deleteNetwork = (idx: number) => handleCrud('delete', 'blockchain-networks', { network: details.supportedBlockchainNetworks[idx] }, 'Network deleted!');

    const saveGeneralSettings = (settings) => handleCrud('put', 'general-settings', settings, 'Settings updated!');

    let section = null;
    if (tab === "general") {
        section = <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3"><GeneralSettingsManager settings={details} onSave={saveGeneralSettings} /></div>;
    } else if (tab === "tokens") {
        section = <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3"><CrudManager items={details.supportedTokens} onAdd={addToken} onEdit={editToken} onDelete={deleteToken} itemName="Supported Tokens" itemLabel="Token" icon={Wallet} /></div>;
    } else if (tab === "merchants") {
        section = <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3"><CrudManager items={details.merchants} onAdd={addMerchant} onEdit={editMerchant} onDelete={deleteMerchant} itemName="Merchants" itemLabel="Merchant" icon={Wallet} /></div>;
    } else if (tab === "networks") {
        section = <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3"><CrudManager items={details.supportedBlockchainNetworks} onAdd={addNetwork} onEdit={editNetwork} onDelete={deleteNetwork} itemName="Supported Networks" itemLabel="Network" icon={Network} /></div>;
    }

    return (
        <div className="relative">
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
            {error && <div className="fixed bottom-5 right-5 bg-red-100 border border-red-400 text-red-800 px-3 py-2 rounded shadow text-xs z-50">{error}</div>}
            {loading ? <p>Loading...</p> : section}
        </div>
    );
}
