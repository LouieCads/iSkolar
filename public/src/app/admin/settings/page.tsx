"use client";

import { redirect } from 'next/navigation';

export default function AdminSettings() {
  redirect('/admin/settings/general');
}