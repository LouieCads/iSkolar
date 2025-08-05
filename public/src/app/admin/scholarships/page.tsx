"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Edit, 
  Trash2,
  FileBadge,
  Building,
  GraduationCap,
  Calendar,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock Data
const mockScholarships = [
  {
    _id: "1",
    title: "TechCorp Computer Science Scholarship",
    sponsor: {
      name: "TechCorp Solutions",
      type: "Corporate"
    },
    school: "University of the Philippines",
    type: "Merit-based",
    purpose: "Tuition",
    amount: 50000,
    numberOfScholars: 10,
    currentApplicants: 45,
    status: "active",
    deadline: "2024-03-15T23:59:59Z",
    createdAt: "2024-01-10T09:00:00Z",
    criteria: ["Computer Science", "3rd Year", "GPA ≥ 3.5"],
    description: "Full tuition scholarship for outstanding Computer Science students"
  },
  {
    _id: "2",
    title: "Engineering Excellence Grant",
    sponsor: {
      name: "John Smith",
      type: "Individual"
    },
    school: "Ateneo de Manila University",
    type: "Merit-based",
    purpose: "Tuition",
    amount: 75000,
    numberOfScholars: 5,
    currentApplicants: 23,
    status: "active",
    deadline: "2024-04-20T23:59:59Z",
    createdAt: "2024-01-15T14:30:00Z",
    criteria: ["Engineering", "4th Year", "GPA ≥ 3.8"],
    description: "Comprehensive scholarship for engineering students with exceptional academic records"
  },
  {
    _id: "3",
    title: "Nursing Care Scholarship",
    sponsor: {
      name: "HealthCare Foundation",
      type: "Corporate"
    },
    school: "University of Santo Tomas",
    type: "Skill-based",
    purpose: "Allowance",
    amount: 25000,
    numberOfScholars: 15,
    currentApplicants: 67,
    status: "active",
    deadline: "2024-02-28T23:59:59Z",
    createdAt: "2024-01-08T11:15:00Z",
    criteria: ["Nursing", "2nd Year", "Clinical Experience"],
    description: "Monthly allowance for nursing students with clinical experience"
  },
  {
    _id: "4",
    title: "Business Leadership Award",
    sponsor: {
      name: "ABC Corporation",
      type: "Corporate"
    },
    school: "De La Salle University",
    type: "Merit-based",
    purpose: "Tuition",
    amount: 60000,
    numberOfScholars: 8,
    currentApplicants: 34,
    status: "closed",
    deadline: "2024-01-31T23:59:59Z",
    createdAt: "2024-01-05T16:45:00Z",
    criteria: ["Business Administration", "3rd Year", "Leadership Experience"],
    description: "Scholarship for business students demonstrating leadership potential"
  },
  {
    _id: "5",
    title: "Arts and Culture Grant",
    sponsor: {
      name: "Maria Santos",
      type: "Individual"
    },
    school: "University of the Philippines",
    type: "Skill-based",
    purpose: "Allowance",
    amount: 30000,
    numberOfScholars: 12,
    currentApplicants: 28,
    status: "active",
    deadline: "2024-05-10T23:59:59Z",
    createdAt: "2024-01-20T10:20:00Z",
    criteria: ["Fine Arts", "Any Year", "Portfolio Required"],
    description: "Support for talented fine arts students with strong portfolios"
  }
];

const ScholarshipTable = ({ scholarships, onView, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getSponsorIcon = (type) => {
    return type === 'Corporate' ? (
      <Building className="h-4 w-4 text-green-600" />
    ) : (
      <Users className="h-4 w-4 text-blue-600" />
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDeadlineNear = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Scholarship
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sponsor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              School
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applicants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {scholarships.map((scholarship) => (
            <tr key={scholarship._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileBadge className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {scholarship.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {scholarship.type} • {scholarship.purpose}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getSponsorIcon(scholarship.sponsor.type)}
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-900">
                      {scholarship.sponsor.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {scholarship.sponsor.type}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {scholarship.school}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="font-medium">{formatCurrency(scholarship.amount)}</div>
                <div className="text-gray-500">per scholar</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="font-medium">{scholarship.currentApplicants}</div>
                <div className="text-gray-500">of {scholarship.numberOfScholars} slots</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className={`font-medium ${
                  isDeadlinePassed(scholarship.deadline) 
                    ? 'text-red-600' 
                    : isDeadlineNear(scholarship.deadline) 
                    ? 'text-yellow-600' 
                    : 'text-gray-900'
                }`}>
                  {formatDate(scholarship.deadline)}
                </div>
                {isDeadlineNear(scholarship.deadline) && (
                  <div className="text-xs text-yellow-600">Deadline near</div>
                )}
                {isDeadlinePassed(scholarship.deadline) && (
                  <div className="text-xs text-red-600">Expired</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(scholarship.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onView(scholarship)}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(scholarship)}
                    className="text-green-600 hover:text-green-900"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(scholarship)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState(mockScholarships);
  const [filteredScholarships, setFilteredScholarships] = useState(mockScholarships);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    let filtered = scholarships;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(scholarship => {
        const title = scholarship.title.toLowerCase();
        const sponsor = scholarship.sponsor.name.toLowerCase();
        const school = scholarship.school.toLowerCase();
        
        return title.includes(searchTerm.toLowerCase()) || 
               sponsor.includes(searchTerm.toLowerCase()) || 
               school.includes(searchTerm.toLowerCase());
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(scholarship => scholarship.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(scholarship => scholarship.type === typeFilter);
    }

    // Apply purpose filter
    if (purposeFilter !== 'all') {
      filtered = filtered.filter(scholarship => scholarship.purpose === purposeFilter);
    }

    setFilteredScholarships(filtered);
    setCurrentPage(1);
  }, [scholarships, searchTerm, statusFilter, typeFilter, purposeFilter]);

  const handleView = (scholarship) => {
    console.log('View scholarship:', scholarship);
    // Implement view functionality
  };

  const handleEdit = (scholarship) => {
    console.log('Edit scholarship:', scholarship);
    // Implement edit functionality
  };

  const handleDelete = (scholarship) => {
    console.log('Delete scholarship:', scholarship);
    // Implement delete functionality
  };

  const fetchData = () => {
    console.log('Fetching scholarships data...');
    // Implement API call
  };

  // Calculate stats
  const totalScholarships = scholarships.length;
  const activeScholarships = scholarships.filter(s => s.status === 'active').length;
  const totalAmount = scholarships.reduce((sum, s) => sum + (s.amount * s.numberOfScholars), 0);
  const totalApplicants = scholarships.reduce((sum, s) => sum + s.currentApplicants, 0);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredScholarships.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-PH').format(num);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scholarships</h1>
          <p className="text-gray-600 mt-2">Manage and monitor all scholarships on the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Scholarships</CardTitle>
              <FileBadge className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalScholarships)}</div>
              <p className="text-xs text-gray-500 mt-1">All scholarships</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Scholarships</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(activeScholarships)}</div>
              <p className="text-xs text-gray-500 mt-1">Currently accepting applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-gray-500 mt-1">Combined scholarship value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(totalApplicants)}</div>
              <p className="text-xs text-gray-500 mt-1">Across all scholarships</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search scholarships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Merit-based">Merit-based</option>
                  <option value="Skill-based">Skill-based</option>
                </select>

                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Purposes</option>
                  <option value="Tuition">Tuition</option>
                  <option value="Allowance">Allowance</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchData}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredScholarships.length)} of {filteredScholarships.length} results
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ScholarshipTable
            scholarships={currentItems}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
