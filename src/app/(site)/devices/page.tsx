'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumb from "@/components/Common/Breadcrumb";
import PreLoader from "@/components/Common/PreLoader";
import toast from "react-hot-toast";

interface Device {
  id: string;
  name: string;
  lastUsed: string;
  fingerprint: string;
  userAgent: string;
  location: string;
}

interface SubscriptionData {
  maxDevices: number;
  registeredDevices: number;
}

export default function DeviceManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceLocation, setNewDeviceLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [isDeletingDevice, setIsDeletingDevice] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchDevices();
    }
  }, [status, router]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      if (!response.ok) {
        throw new Error('Failed to fetch devices');
      }
      const data = await response.json();
      setDevices(data.devices);
      setSubscriptionData({
        maxDevices: data.subscription.maxDevices,
        registeredDevices: data.subscription.registeredDevices
      });
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('Failed to fetch devices. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addDevice = async () => {
    if (!newDeviceName || !newDeviceLocation) {
      toast.error('Device Name and Location are required.');
      return;
    }

    try {
      setIsAddingDevice(true);
      const fp = await import('@fingerprintjs/fingerprintjs');
      const fpPromise = await fp.load();
      const result = await fpPromise.get();

      console.log('Sending device data:', {
        name: newDeviceName,
        location: newDeviceLocation,
        fingerprint: result.visitorId,
        userAgent: navigator.userAgent,
      });

      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDeviceName,
          location: newDeviceLocation,
          fingerprint: result.visitorId,
          userAgent: navigator.userAgent,
        }),
      });

      const data = await response.json();
      console.log('Response data:', data); // Add logging

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add device');
      }

      // Update local state with new device
      setDevices(prevDevices => [...prevDevices, data.device]);
      
      // Update subscription data if provided
      if (data.subscription) {
        setSubscriptionData({
          maxDevices: data.subscription.maxDevices,
          registeredDevices: data.subscription.registeredDevices
        });
      }

      // Clear form
      setNewDeviceName('');
      setNewDeviceLocation('');
      toast.success('Device added successfully');

    } catch (error: any) {
      console.error('Error adding device:', error);
      toast.error(error.message || 'Failed to add device');
    } finally {
      setIsAddingDevice(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      setIsDeletingDevice(deviceId);
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response has content before trying to parse it
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete device');
      }

      toast.success('Device deleted successfully');
      fetchDevices(); // Refresh the devices list
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete device');
    } finally {
      setIsDeletingDevice(null);
    }
  };

  if (isLoading) {
    return <PreLoader />;
  }

  const remainingDevices = subscriptionData ? subscriptionData.maxDevices - subscriptionData.registeredDevices : 0;

  return (
    <>
      <Breadcrumb pageName="Device Management" />
      <div className="relative z-10 overflow-hidden bg-gray-1 pt-[120px] pb-[100px] dark:bg-dark-2 md:pt-[130px] lg:pt-[160px]">
        <div className="container">
          <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8 mb-8">
            <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
              Device Usage
            </h2>
            <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-body-color">
                  Devices Used: {subscriptionData?.registeredDevices || 0} of {subscriptionData?.maxDevices || 0}
                </p>
                <span className={`text-sm font-medium ${
                  remainingDevices > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {remainingDevices} remaining
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-dark-3">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{
                    width: `${((subscriptionData?.registeredDevices || 0) / (subscriptionData?.maxDevices || 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
            <h2 className="mb-8 text-2xl font-bold text-black dark:text-white">
              Add New Device
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Device Name"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full rounded-md border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Device Location"
                    value={newDeviceLocation}
                    onChange={(e) => setNewDeviceLocation(e.target.value)}
                    className="w-full rounded-md border border-stroke bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-dark-6"
                    required
                  />
                </div>
              </div>
              <button
                onClick={addDevice}
                disabled={
                  isAddingDevice ||
                  !newDeviceName ||
                  !newDeviceLocation ||
                  remainingDevices === 0
                }
                className="w-full rounded-md bg-primary px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-opacity-80 hover:shadow-signUp disabled:opacity-50"
              >
                {isAddingDevice ? "Adding Device..." : "Add Device"}
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <div key={device.id} className="mb-4 rounded-lg border border-stroke bg-white p-4 dark:border-dark-3 dark:bg-dark-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {device.name}
                    </h3>
                    <p className="text-sm text-body-color">{device.location}</p>
                    <p className="text-xs text-body-color">
                      Last used: {new Date(device.lastUsed).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this device?')) {
                        handleDeleteDevice(device.id);
                      }
                    }}
                    disabled={isDeletingDevice === device.id}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeletingDevice === device.id ? (
                      <span>Deleting...</span>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 