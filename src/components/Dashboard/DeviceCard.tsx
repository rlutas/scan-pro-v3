import Link from "next/link";
import { useEffect, useState } from "react";

interface Device {
  id: string;
  name: string;
  lastUsed: string;
  location: string;
  fingerprint: string;
  userAgent: string;
}

interface SubscriptionData {
  maxDevices: number;
  registeredDevices: number;
  plan: string;
  status: string;
}

const DeviceCard = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch('/api/devices');
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        const data = await response.json();
        setDevices(data.devices);
        setSubscription({
          maxDevices: data.subscription.maxDevices,
          registeredDevices: data.subscription.registeredDevices,
          plan: data.subscription.plan,
          status: data.subscription.status
        });
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load device data');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) {
    return (
      <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-dark-3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-dark-3" />
                <div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-dark-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Device Management
        </h2>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
          <p className="text-sm font-medium text-body-color">Device Usage</p>
          <p className="mt-2 text-lg font-semibold text-black dark:text-white">
            {subscription?.registeredDevices || 0} of {subscription?.maxDevices || 0} devices
          </p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-dark-3">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{
                width: `${((subscription?.registeredDevices || 0) / (subscription?.maxDevices || 1)) * 100}%`
              }}
            />
          </div>
        </div>

        {devices.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-body-color">Recent Devices</p>
            {devices.slice(0, 3).map((device) => (
              <div
                key={device.id}
                className="rounded-lg border border-stroke bg-gray-1 p-4 transition-all hover:bg-gray-2 dark:border-dark-3 dark:bg-dark-3 dark:hover:bg-dark-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-black dark:text-white">
                    {device.name}
                  </p>
                  <span className="text-sm text-body-color">{device.location}</span>
                </div>
                <p className="mt-2 text-sm text-body-color">
                  Last used: {new Date(device.lastUsed).toLocaleDateString()}
                </p>
                <p className="mt-1 text-xs text-body-color">
                  ID: {device.fingerprint.slice(0, 8)}...
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base text-body-color">No devices registered yet</p>
        )}

        <div className="pt-4">
          <Link
            href="/devices"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
          >
            Manage Devices
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard; 