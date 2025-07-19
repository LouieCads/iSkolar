import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Save, BookOpen, Layers, School } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Notification ---
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

// --- Delete Confirmation Modal ---
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

// --- Segmented Control ---
const TABS = [
  { id: "courses", label: "Course List", icon: BookOpen },
  { id: "years", label: "Year Levels", icon: Layers },
  { id: "schools", label: "Schools", icon: School },
];

export function AcademicDetails() {
  // Reference values
  const defaultCourses = ["BSCS", "BSECE", "BSBA", "BSIT", "BSA", "BSN", "BSED", "BSEE", "BSME", "BSTM"];
  const defaultYears = [
    "1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Master’s"
  ];
  const defaultSchools = [
    "University of the Philippines", "Ateneo de Manila University", "De La Salle University", "Mapua University", "Far Eastern University"
  ];

  // State
  const [tab, setTab] = useState("courses");
  const [courses, setCourses] = useState<string[]>(defaultCourses);
  const [years, setYears] = useState<string[]>(defaultYears);
  const [schools, setSchools] = useState<string[]>(defaultSchools);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // --- Course List Handlers ---
  const [newCourse, setNewCourse] = useState("");
  const [editingCourseIdx, setEditingCourseIdx] = useState<number | null>(null);
  const [editCourseValue, setEditCourseValue] = useState("");
  const [deleteCourseIdx, setDeleteCourseIdx] = useState<number | null>(null);

  const addCourse = () => {
    if (!newCourse.trim() || courses.includes(newCourse)) return;
    setCourses([...courses, newCourse]);
    setNewCourse("");
    setNotification({ show: true, type: 'add', message: 'Course added!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const editCourse = (idx: number, value: string) => {
    if (!value.trim() || courses.includes(value)) return;
    const updated = [...courses];
    updated[idx] = value;
    setCourses(updated);
    setEditingCourseIdx(null);
    setNotification({ show: true, type: 'edit', message: 'Course updated!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const deleteCourse = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
    setNotification({ show: true, type: 'delete', message: 'Course deleted!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // --- Year Level Handlers ---
  const [newYear, setNewYear] = useState("");
  const [editingYearIdx, setEditingYearIdx] = useState<number | null>(null);
  const [editYearValue, setEditYearValue] = useState("");
  const [deleteYearIdx, setDeleteYearIdx] = useState<number | null>(null);

  const addYear = () => {
    if (!newYear.trim() || years.includes(newYear)) return;
    setYears([...years, newYear]);
    setNewYear("");
    setNotification({ show: true, type: 'add', message: 'Year level added!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const editYear = (idx: number, value: string) => {
    if (!value.trim() || years.includes(value)) return;
    const updated = [...years];
    updated[idx] = value;
    setYears(updated);
    setEditingYearIdx(null);
    setNotification({ show: true, type: 'edit', message: 'Year level updated!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const deleteYear = (idx: number) => {
    setYears(years.filter((_, i) => i !== idx));
    setNotification({ show: true, type: 'delete', message: 'Year level deleted!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // --- School/University Handlers ---
  const [newSchool, setNewSchool] = useState("");
  const [editingSchoolIdx, setEditingSchoolIdx] = useState<number | null>(null);
  const [editSchoolValue, setEditSchoolValue] = useState("");
  const [deleteSchoolIdx, setDeleteSchoolIdx] = useState<number | null>(null);

  const addSchool = () => {
    if (!newSchool.trim() || schools.includes(newSchool)) return;
    setSchools([...schools, newSchool]);
    setNewSchool("");
    setNotification({ show: true, type: 'add', message: 'School added!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const editSchool = (idx: number, value: string) => {
    if (!value.trim() || schools.includes(value)) return;
    const updated = [...schools];
    updated[idx] = value;
    setSchools(updated);
    setEditingSchoolIdx(null);
    setNotification({ show: true, type: 'edit', message: 'School updated!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };
  const deleteSchool = (idx: number) => {
    setSchools(schools.filter((_, i) => i !== idx));
    setNotification({ show: true, type: 'delete', message: 'School deleted!' });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  // --- Rendered Section ---
  let section = null;
  if (tab === "courses") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpen className="w-4 h-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-900">Course List</h3>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end mb-2">
          <div className="flex-1">
            <Label className="text-xs font-medium text-gray-700">Course Name</Label>
            <Input
              value={newCourse}
              onChange={e => setNewCourse(e.target.value)}
              placeholder="e.g., BSCS"
              className="mt-1 text-xs"
            />
          </div>
          <Button
            onClick={addCourse}
            disabled={!newCourse.trim()}
            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
          >
            <Plus className="w-2 h-2" /> Add Course
          </Button>
        </div>
        <div className="space-y-1">
          {courses.map((course, idx) => (
            <div key={course} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
              {editingCourseIdx === idx ? (
                <>
                  <Input
                    value={editCourseValue}
                    onChange={e => setEditCourseValue(e.target.value)}
                    className="text-xs mr-2"
                  />
                  <Button
                    onClick={() => editCourse(idx, editCourseValue)}
                    disabled={!editCourseValue.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setEditingCourseIdx(null)}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                  >Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-900">{course}</span>
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => { setEditingCourseIdx(idx); setEditCourseValue(course); }}
                      className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit Course"
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteCourseIdx(idx)}
                      className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                      title="Delete Course"
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
          show={deleteCourseIdx !== null}
          label={deleteCourseIdx !== null ? courses[deleteCourseIdx] : ""}
          onCancel={() => setDeleteCourseIdx(null)}
          onConfirm={() => { deleteCourse(deleteCourseIdx!); setDeleteCourseIdx(null); }}
        />
      </div>
    );
  } else if (tab === "years") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">Year Levels</h3>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end mb-2">
          <div className="flex-1">
            <Label className="text-xs font-medium text-gray-700">Year Level</Label>
            <Input
              value={newYear}
              onChange={e => setNewYear(e.target.value)}
              placeholder="e.g., 1st Year"
              className="mt-1 text-xs"
            />
          </div>
          <Button
            onClick={addYear}
            disabled={!newYear.trim()}
            className="px-2 py-1 bg-purple-600 text-white rounded text-xs"
          >
            <Plus className="w-2 h-2" /> Add Year
          </Button>
        </div>
        <div className="space-y-1">
          {years.map((year, idx) => (
            <div key={year} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
              {editingYearIdx === idx ? (
                <>
                  <Input
                    value={editYearValue}
                    onChange={e => setEditYearValue(e.target.value)}
                    className="text-xs mr-2"
                  />
                  <Button
                    onClick={() => editYear(idx, editYearValue)}
                    disabled={!editYearValue.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setEditingYearIdx(null)}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                  >Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-900">{year}</span>
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => { setEditingYearIdx(idx); setEditYearValue(year); }}
                      className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit Year"
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteYearIdx(idx)}
                      className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                      title="Delete Year"
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
          show={deleteYearIdx !== null}
          label={deleteYearIdx !== null ? years[deleteYearIdx] : ""}
          onCancel={() => setDeleteYearIdx(null)}
          onConfirm={() => { deleteYear(deleteYearIdx!); setDeleteYearIdx(null); }}
        />
      </div>
    );
  } else if (tab === "schools") {
    section = (
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <School className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Schools</h3>
        </div>
        <div className="bg-gray-50 p-2 rounded border border-gray-200 flex gap-2 items-end mb-2">
          <div className="flex-1">
            <Label className="text-xs font-medium text-gray-700">School Name</Label>
            <Input
              value={newSchool}
              onChange={e => setNewSchool(e.target.value)}
              placeholder="e.g., University of the Philippines"
              className="mt-1 text-xs"
            />
          </div>
          <Button
            onClick={addSchool}
            disabled={!newSchool.trim()}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            <Plus className="w-2 h-2" /> Add School
          </Button>
        </div>
        <div className="space-y-1">
          {schools.map((school, idx) => (
            <div key={school} className="bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
              {editingSchoolIdx === idx ? (
                <>
                  <Input
                    value={editSchoolValue}
                    onChange={e => setEditSchoolValue(e.target.value)}
                    className="text-xs mr-2"
                  />
                  <Button
                    onClick={() => editSchool(idx, editSchoolValue)}
                    disabled={!editSchoolValue.trim()}
                    className="px-1.5 py-0.5 bg-green-600 text-white rounded text-xs"
                  >
                    <Save className="w-2.5 h-2.5" />
                  </Button>
                  <Button
                    onClick={() => setEditingSchoolIdx(null)}
                    className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs ml-1"
                  >Cancel</Button>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-gray-900">{school}</span>
                  <div className="flex gap-0.5">
                    <Button
                      onClick={() => { setEditingSchoolIdx(idx); setEditSchoolValue(school); }}
                      className="p-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                      title="Edit School"
                    >
                      <Edit className="w-2.5 h-2.5" />
                    </Button>
                    <Button
                      onClick={() => setDeleteSchoolIdx(idx)}
                      className="p-0.5 bg-red-50 text-red-600 hover:bg-red-100 rounded"
                      title="Delete School"
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
          show={deleteSchoolIdx !== null}
          label={deleteSchoolIdx !== null ? schools[deleteSchoolIdx] : ""}
          onCancel={() => setDeleteSchoolIdx(null)}
          onConfirm={() => { deleteSchool(deleteSchoolIdx!); setDeleteSchoolIdx(null); }}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-700" /> Academic Details
        </h1>
        <p className="text-xs text-gray-600">Manage course list, year levels, and universities/schools</p>
      </div>
      {/* Segmented Control */}
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
      {section}
    </div>
  );
}
