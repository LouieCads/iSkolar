import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit, Trash2, Save, Award, Target, Tag } from "lucide-react";

// Types for scholarship configuration
interface ScholarshipType {
  id: string;
  name: string;
  description: string;
}

interface ScholarshipPurpose {
  id: string;
  name: string;
  description: string;
}

interface CriteriaTag {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface FormValues {
  scholarshipTypes: ScholarshipType[];
  scholarshipPurposes: ScholarshipPurpose[];
  criteriaTags: CriteriaTag[];
}

// Validation schema
const validationSchema = Yup.object({
  scholarshipTypes: Yup.array().of(
    Yup.object({
      name: Yup.string().min(2, "Type name must be at least 2 characters").required("Type name is required"),
      description: Yup.string().min(5, "Description must be at least 5 characters").required("Description is required"),
    })
  ).min(1, "At least one scholarship type is required"),
  scholarshipPurposes: Yup.array().of(
    Yup.object({
      name: Yup.string().min(2, "Purpose name must be at least 2 characters").required("Purpose name is required"),
      description: Yup.string().min(5, "Description must be at least 5 characters").required("Description is required"),
    })
  ).min(1, "At least one scholarship purpose is required"),
  criteriaTags: Yup.array().of(
    Yup.object({
      name: Yup.string().min(2, "Tag name must be at least 2 characters").required("Tag name is required"),
      category: Yup.string().required("Category is required"),
      description: Yup.string().min(5, "Description must be at least 5 characters").required("Description is required"),
    })
  ),
});

// Scholarship Type Management Component
const ScholarshipTypeManager = ({ types, onAdd, onEdit, onDelete }) => {
  const [editingType, setEditingType] = useState<ScholarshipType | null>(null);
  const [newType, setNewType] = useState({ name: "", description: "" });

  const handleAdd = () => {
    if (newType.name.trim() && newType.description.trim()) {
      onAdd({ id: Date.now().toString(), ...newType });
      setNewType({ name: "", description: "" });
    }
  };

  const handleEdit = (type: ScholarshipType) => {
    setEditingType(type);
  };

  const handleSaveEdit = () => {
    if (editingType && editingType.name.trim() && editingType.description.trim()) {
      onEdit(editingType);
      setEditingType(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingType(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Award className="w-3 h-3 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Scholarship Types</h3>
      </div>
      
      {/* Add new type */}
      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          <div>
            <Label className="text-xs font-medium text-gray-700">Type Name</Label>
            <Input
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              placeholder="e.g., Merit-based"
              className="mt-1 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-gray-700">Description</Label>
            <Input
              value={newType.description}
              onChange={(e) => setNewType({ ...newType, description: e.target.value })}
              placeholder="e.g., Based on academic standing (GWA, Dean's List)"
              className="mt-1 text-xs"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newType.name.trim() || !newType.description.trim()}
          className="mt-1.5 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs"
        >
          <Plus className="w-2 h-2" />
          Add Type
        </Button>
      </div>

      {/* Existing types */}
      <div className="space-y-1">
        {types.map((type) => (
          <div key={type.id} className="bg-white p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow">
            {editingType?.id === type.id ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Type Name</Label>
                    <Input
                      value={editingType.name}
                      onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium text-gray-700">Description</Label>
                    <Input
                      value={editingType.description}
                      onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editingType.name.trim() || !editingType.description.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-0.5 text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-xs">{type.name}</h4>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => handleEdit(type)}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Type"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(type.id)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Type"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Scholarship Purpose Management Component
const ScholarshipPurposeManager = ({ purposes, onAdd, onEdit, onDelete }) => {
  const [editingPurpose, setEditingPurpose] = useState<ScholarshipPurpose | null>(null);
  const [newPurpose, setNewPurpose] = useState({ name: "", description: "" });

  const handleAdd = () => {
    if (newPurpose.name.trim() && newPurpose.description.trim()) {
      onAdd({ id: Date.now().toString(), ...newPurpose });
      setNewPurpose({ name: "", description: "" });
    }
  };

  const handleEdit = (purpose: ScholarshipPurpose) => {
    setEditingPurpose(purpose);
  };

  const handleSaveEdit = () => {
    if (editingPurpose && editingPurpose.name.trim() && editingPurpose.description.trim()) {
      onEdit(editingPurpose);
      setEditingPurpose(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPurpose(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Target className="w-3 h-3 text-green-600" />
        <h3 className="text-sm font-semibold text-gray-900">Scholarship Purposes</h3>
      </div>
      
      {/* Add new purpose */}
      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          <div>
            <Label className="text-xs font-medium text-gray-700">Purpose Name</Label>
            <Input
              value={newPurpose.name}
              onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
              placeholder="e.g., Tuition"
              className="mt-1 text-xs"
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-gray-700">Description</Label>
            <Input
              value={newPurpose.description}
              onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
              placeholder="e.g., Intended for covering school fees"
              className="mt-1 text-xs"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newPurpose.name.trim() || !newPurpose.description.trim()}
          className="mt-1.5 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1 text-xs"
        >
          <Plus className="w-2 h-2" />
          Add Purpose
        </Button>
      </div>

      {/* Existing purposes */}
      <div className="space-y-1">
        {purposes.map((purpose) => (
          <div key={purpose.id} className="bg-white p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow">
            {editingPurpose?.id === purpose.id ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Purpose Name</Label>
                    <Input
                      value={editingPurpose.name}
                      onChange={(e) => setEditingPurpose({ ...editingPurpose, name: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium text-gray-700">Description</Label>
                    <Input
                      value={editingPurpose.description}
                      onChange={(e) => setEditingPurpose({ ...editingPurpose, description: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editingPurpose.name.trim() || !editingPurpose.description.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-0.5 text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-xs">{purpose.name}</h4>
                  <p className="text-xs text-gray-600">{purpose.description}</p>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => handleEdit(purpose)}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Purpose"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(purpose.id)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Purpose"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Criteria Tags Management Component
const CriteriaTagsManager = ({ tags, onAdd, onEdit, onDelete }) => {
  const [editingTag, setEditingTag] = useState<CriteriaTag | null>(null);
  const [newTag, setNewTag] = useState({ name: "", category: "", description: "" });

  const categories = [
    "Academic",
    "Demographic",
    "Financial",
    "Geographic",
    "Skills",
    "Other"
  ];

  const handleAdd = () => {
    if (newTag.name.trim() && newTag.category && newTag.description.trim()) {
      onAdd({ id: Date.now().toString(), ...newTag });
      setNewTag({ name: "", category: "", description: "" });
    }
  };

  const handleEdit = (tag: CriteriaTag) => {
    setEditingTag(tag);
  };

  const handleSaveEdit = () => {
    if (editingTag && editingTag.name.trim() && editingTag.category && editingTag.description.trim()) {
      onEdit(editingTag);
      setEditingTag(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Academic: "bg-blue-100 text-blue-800",
      Demographic: "bg-purple-100 text-purple-800",
      Financial: "bg-green-100 text-green-800",
      Geographic: "bg-orange-100 text-orange-800",
      Skills: "bg-pink-100 text-pink-800",
      Other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <Tag className="w-3 h-3 text-purple-600" />
        <h3 className="text-sm font-semibold text-gray-900">Criteria Tags</h3>
      </div>
      
      {/* Add new tag */}
      <div className="bg-gray-50 p-2 rounded border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
          <div>
            <Label className="text-xs font-medium text-gray-700">Tag Name</Label>
            <Input
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="e.g., Nursing"
              className="mt-1 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700">Category</Label>
            <select
              value={newTag.category}
              onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
              className="mt-1 w-full px-1.5 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-gray-700">Description</Label>
            <Input
              value={newTag.description}
              onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
              placeholder="e.g., Students enrolled in Nursing programs"
              className="mt-1 text-xs"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!newTag.name.trim() || !newTag.category || !newTag.description.trim()}
          className="mt-1.5 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs"
        >
          <Plus className="w-2.5 h-2" />
          Add Tag
        </Button>
      </div>

      {/* Existing tags */}
      <div className="space-y-1">
        {tags.map((tag) => (
          <div key={tag.id} className="bg-white p-2 rounded border border-gray-200 hover:shadow-sm transition-shadow">
            {editingTag?.id === tag.id ? (
              <div className="space-y-1.5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1.5">
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Tag Name</Label>
                    <Input
                      value={editingTag.name}
                      onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-gray-700">Category</Label>
                    <select
                      value={editingTag.category}
                      onChange={(e) => setEditingTag({ ...editingTag, category: e.target.value })}
                      className="mt-1 w-full px-1.5 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs font-medium text-gray-700">Description</Label>
                    <Input
                      value={editingTag.description}
                      onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editingTag.name.trim() || !editingTag.category || !editingTag.description.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-0.5 text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-0.5">
                    <h4 className="font-medium text-gray-900 text-xs">{tag.name}</h4>
                    <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tag.category)}`}>
                      {tag.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{tag.description}</p>
                </div>
                <div className="flex gap-0.5">
                  <Button
                    onClick={() => handleEdit(tag)}
                    className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                    title="Edit Tag"
                  >
                    <Edit className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => onDelete(tag.id)}
                    className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                    title="Delete Tag"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Scholarship Details Component
export function ScholarshipDetails(): React.JSX.Element {
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Default data - in a real app, this would come from an API
  const defaultData = {
    scholarshipTypes: [
      { id: "1", name: "Merit-based", description: "Based on academic standing (GWA, Dean's List)" },
      { id: "2", name: "Skill-based", description: "Based on submitted credentials (Awards, Certifications)" }
    ],
    scholarshipPurposes: [
      { id: "1", name: "Tuition", description: "Intended for covering school fees" },
      { id: "2", name: "Allowance", description: "Provides financial support for daily needs" }
    ],
    criteriaTags: [
      { id: "1", name: "Nursing", category: "Academic", description: "Students enrolled in Nursing programs" },
      { id: "2", name: "3rd Year", category: "Academic", description: "Students in their third year of study" },
      { id: "3", name: "Public School", category: "Demographic", description: "Students from public schools" },
      { id: "4", name: "GPA ≥ 90", category: "Academic", description: "Students with GPA of 90 or higher" }
    ]
  };

  const formik = useFormik<FormValues>({
    initialValues: defaultData,
    validationSchema,
    onSubmit: async (values: FormValues) => {
      try {
        setLoading(true);
        setError("");
        setShowSuccessNotification(false);
        
        // Simulate API call - replace with actual API endpoint
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would make the actual API call:
        // await axios.post('/api/admin/scholarship-details', values);
        
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } catch (err) {
        setError("Failed to save scholarship details");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddType = (type: ScholarshipType) => {
    formik.setFieldValue("scholarshipTypes", [...formik.values.scholarshipTypes, type]);
  };

  const handleEditType = (editedType: ScholarshipType) => {
    const updatedTypes = formik.values.scholarshipTypes.map(type =>
      type.id === editedType.id ? editedType : type
    );
    formik.setFieldValue("scholarshipTypes", updatedTypes);
  };

  const handleDeleteType = (typeId: string) => {
    const updatedTypes = formik.values.scholarshipTypes.filter(type => type.id !== typeId);
    formik.setFieldValue("scholarshipTypes", updatedTypes);
  };

  const handleAddPurpose = (purpose: ScholarshipPurpose) => {
    formik.setFieldValue("scholarshipPurposes", [...formik.values.scholarshipPurposes, purpose]);
  };

  const handleEditPurpose = (editedPurpose: ScholarshipPurpose) => {
    const updatedPurposes = formik.values.scholarshipPurposes.map(purpose =>
      purpose.id === editedPurpose.id ? editedPurpose : purpose
    );
    formik.setFieldValue("scholarshipPurposes", updatedPurposes);
  };

  const handleDeletePurpose = (purposeId: string) => {
    const updatedPurposes = formik.values.scholarshipPurposes.filter(purpose => purpose.id !== purposeId);
    formik.setFieldValue("scholarshipPurposes", updatedPurposes);
  };

  const handleAddTag = (tag: CriteriaTag) => {
    formik.setFieldValue("criteriaTags", [...formik.values.criteriaTags, tag]);
  };

  const handleEditTag = (editedTag: CriteriaTag) => {
    const updatedTags = formik.values.criteriaTags.map(tag =>
      tag.id === editedTag.id ? editedTag : tag
    );
    formik.setFieldValue("criteriaTags", updatedTags);
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = formik.values.criteriaTags.filter(tag => tag.id !== tagId);
    formik.setFieldValue("criteriaTags", updatedTags);
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900">Scholarship Details</h1>
        <p className="text-xs text-gray-600">Manage scholarship types, purposes, and criteria tags</p>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccessNotification && (
          <motion.div
            initial={{ opacity: 1, x: 500 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 500 }}
            transition={{
              type: "spring",
              stiffness: 900,
              damping: 25,
              duration: 0.2,
            }}
            className="fixed w-[300px] flex justify-end items-center h-[50px] bottom-5 right-5 rounded-md text-[#002828] bg-[#26D871] shadow-xl z-100"
          >
            <div className="flex gap-2 items-center w-[295px] h-[50px] bg-gray-50 rounded border-white px-2 py-1">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="#26D871"
                  className="bi bi-check-square-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-xs">Success</p>
                <p className="text-xs">Scholarship details updated!</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded z-10 text-xs">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {/* Scholarship Types */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <ScholarshipTypeManager
            types={formik.values.scholarshipTypes}
            onAdd={handleAddType}
            onEdit={handleEditType}
            onDelete={handleDeleteType}
          />
        </div>

        {/* Scholarship Purposes */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <ScholarshipPurposeManager
            purposes={formik.values.scholarshipPurposes}
            onAdd={handleAddPurpose}
            onEdit={handleEditPurpose}
            onDelete={handleDeletePurpose}
          />
        </div>

        {/* Criteria Tags */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
          <CriteriaTagsManager
            tags={formik.values.criteriaTags}
            onAdd={handleAddTag}
            onEdit={handleEditTag}
            onDelete={handleDeleteTag}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          type="button"
          onClick={() => formik.handleSubmit()}
          className="px-6 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
          disabled={loading || !formik.isValid}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
