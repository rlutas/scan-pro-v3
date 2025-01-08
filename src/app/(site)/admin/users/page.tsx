"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PreLoader from "@/components/Common/PreLoader";
import toast from "react-hot-toast";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  companyName: string | null;
  cui: string | null;
  subscription: {
    plan: string;
    status: string;
    maxDevices: number;
    nextBillingDate: string | null;
  } | null;
  devices: {
    total: number;
    active: number;
  };
}

const SUBSCRIPTION_PLANS = [
  { name: 'Basic', maxDevices: 2 },
  { name: 'Standard', maxDevices: 5 },
  { name: 'Enterprise', maxDevices: 10 },
];

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubscription = (user: UserData) => {
    setEditingUser(user.id);
    setSelectedPlan(user.subscription?.plan || '');
    setSubscriptionStatus(user.subscription?.status || 'inactive');
  };

  const handleUpdateSubscription = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
          status: subscriptionStatus,
          maxDevices: SUBSCRIPTION_PLANS.find(p => p.name === selectedPlan)?.maxDevices,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      toast.success('Subscription updated successfully');
      setEditingUser(null);
      fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return <PreLoader />;
  }

  return (
    <>
      <Breadcrumb pageName="User Management" />
      <div className="relative z-10 overflow-hidden bg-white px-4 pt-10 pb-16 dark:bg-dark lg:px-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Registered Users
            </h1>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-dark-2">
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Name
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Email
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Company
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Subscription
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Devices
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Status
                  </th>
                  <th className="border-b p-4 text-left font-semibold text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-stroke dark:border-dark-3">
                    <td className="p-4">
                      <span className="text-black dark:text-white">
                        {user.name || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-black dark:text-white">
                        {user.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-black dark:text-white">
                        {user.companyName || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="rounded-md border border-stroke bg-transparent px-3 py-2 text-black dark:text-white"
                        >
                          <option value="">Select Plan</option>
                          {SUBSCRIPTION_PLANS.map((plan) => (
                            <option key={plan.name} value={plan.name}>
                              {plan.name} ({plan.maxDevices} devices)
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-black dark:text-white">
                          {user.subscription?.plan || "No Plan"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="text-black dark:text-white">
                        {user.devices.active}/{user.devices.total}
                      </span>
                    </td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <select
                          value={subscriptionStatus}
                          onChange={(e) => setSubscriptionStatus(e.target.value)}
                          className="rounded-md border border-stroke bg-transparent px-3 py-2 text-black dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          user.subscription?.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-500"
                            : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-500"
                        }`}>
                          {user.subscription?.status || "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUser === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateSubscription(user.id)}
                            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="rounded-md bg-gray-500 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditSubscription(user)}
                          className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90"
                        >
                          Edit Subscription
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
} 