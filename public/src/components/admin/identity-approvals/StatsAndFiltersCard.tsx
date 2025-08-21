// components/admin/kyc-kyb-approvals/StatsAndFiltersCard.tsx

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Clock, CheckCircle, XCircle, GraduationCap, Building } from "lucide-react";

interface Stats {
  total: number;
  unverified: number;
  pending: number;
  verified: number;
  denied: number;
}

interface StatsAndFiltersCardProps {
  stats: Stats;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  personaFilter: string;
  setPersonaFilter: (value: string) => void;
}

export const StatsAndFiltersCard: React.FC<StatsAndFiltersCardProps> = ({
  stats,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  personaFilter,
  setPersonaFilter,
}) => {
  const statItems = [
    { label: "Total", count: stats.total, color: "text-gray-600", icon: Users },
    { label: "Pending", count: stats.pending, color: "text-yellow-600", icon: Clock },
    { label: "Verified", count: stats.verified, color: "text-green-600", icon: CheckCircle },
    { label: "Denied", count: stats.denied, color: "text-red-600", icon: XCircle },
  ];

  return (
    <Card>
      <CardContent className="px-5 py-2">
        <div className="grid grid-cols-5 gap-5">
          {/* Stats Counter - 2 columns with 2x2 grid inside */}
          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-2.5">
              {statItems.map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
                    </div>
                    <div className="p-2 rounded-full bg-white">
                      <stat.icon className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search and Filters - 3 columns */}
          <div className="col-span-3">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative flex gap-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />

                <div className="flex-1">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={personaFilter} onValueChange={setPersonaFilter}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Filter by Persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Personas</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="sponsor">Sponsors</SelectItem>
                      <SelectItem value="school">Schools</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Legend */}
              <div className="bg-gray-50 rounded-lg p-3 border flex items-center justify-around">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Sponsors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Schools</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};