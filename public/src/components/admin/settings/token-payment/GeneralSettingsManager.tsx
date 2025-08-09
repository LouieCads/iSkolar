import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Cog } from "lucide-react";

interface GeneralSettingsManagerProps {
  settings: {
    minimumDeposit: number;
    maximumWithdrawal: number;
    paymentType: string;
  };
  onSave: (settings: any) => void;
}

export default function GeneralSettingsManager({ settings, onSave }: GeneralSettingsManagerProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: value }));
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
          <Input
            type="number"
            name="minimumDeposit"
            value={localSettings.minimumDeposit || ""}
            onChange={handleChange}
            className="mt-1 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs font-medium text-gray-700">Maximum Withdrawal</Label>
          <Input
            type="number"
            name="maximumWithdrawal"
            value={localSettings.maximumWithdrawal || ""}
            onChange={handleChange}
            className="mt-1 text-xs"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSave(localSettings)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-xs">
          <Save className="w-3 h-3 mr-1" /> Save Changes
        </Button>
      </div>
    </div>
  );
}