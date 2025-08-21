'use client';
import React, { useEffect, useState } from 'react';
import KycKybVerificationModal from '@/components/sponsor/IdentityVerificationModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Verification() {
  const [kycStatus, setKycStatus] = useState('unverified');
  const [isLoading, setIsLoading] = useState(true);
  const [statusDetails, setStatusDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        // Get token from localStorage, cookies, or your auth context
        const token = localStorage.getItem('token'); // Adjust based on your auth implementation
        
        const response = await fetch(`${API_BASE_URL}/identity-verification/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 401) {
          console.error('Unauthorized - please login');
          // Redirect to login or handle auth error
          return;
        }
        
        const data = await response.json();
        setKycStatus(data.status);
        setStatusDetails(data);
      } catch (error) {
        console.error('Error fetching KYC status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKycStatus();
  }, []);

  const getStatusBadge = () => {
    const statusColors = {
      unverified: 'bg-gray-100 text-gray-600',
      pending: 'bg-yellow-100 text-yellow-600',
      'pre-approved': 'bg-blue-100 text-blue-600',
      verified: 'bg-green-100 text-green-600',
      denied: 'bg-red-100 text-red-600'
    };

    return (
      <div className="flex flex-col items-end">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[kycStatus] || statusColors.unverified}`}>
          {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
        </span>
        {statusDetails?.denialReason && (
          <p className="text-xs text-red-600 mt-1">{statusDetails.denialReason}</p>
        )}
        {statusDetails?.cooldownUntil && (
          <p className="text-xs text-gray-600 mt-1">
            Cooldown until: {new Date(statusDetails.cooldownUntil).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 pl-35">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8 border border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-blue-900">Welcome to iSkolar</h1>
          {!isLoading && getStatusBadge()}
        </div>
        
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-700">
            Complete your verification to unlock these benefits:
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 cursor-pointer text-white text-bold text-sm py-1.5 px-3 rounded transition-colors duration-200 whitespace-nowrap ml-3 flex items-center"
            disabled={kycStatus === 'pending' || kycStatus === 'verified'}
          >
            {kycStatus === 'verified' ? 'Verified ✓' : 'Get Verified Now'}
            {kycStatus !== 'verified' && (
              <svg 
                className="w-4 h-4 ml-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-lg">✓</span>
            <p className="text-sm text-gray-800">Create and manage scholarship programs with ease</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">✓</span>
            <p className="text-sm text-gray-800">Direct fund transfer to verified educational institutions</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">✓</span>
            <p className="text-sm text-gray-800">Access detailed reports and track scholarship impact</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-lg">✓</span>
            <p className="text-sm text-gray-800">Connect with qualified students from partner universities</p>
          </div>
        </div>
      </div>

      {kycStatus === 'denied' && statusDetails?.cooldownUntil && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-600">
            Your verification was denied. You can resubmit after the cooldown period.
          </p>
        </div>
      )}

      <KycKybVerificationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}