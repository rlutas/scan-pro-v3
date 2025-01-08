"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import QuickActions from "@/components/Dashboard/QuickActions";
import AccountCard from "@/components/Dashboard/AccountCard";
import SubscriptionCard from "@/components/Dashboard/SubscriptionCard";
import DeviceCard from "@/components/Dashboard/DeviceCard";
import PreLoader from "@/components/Common/PreLoader";

interface UserData {
  name: string;
  email: string;
  companyName: string | null;
  cui: string | null;
  subscription: {
    currentPlan: string | null;
    status: string;
    nextBillingDate: string | null;
    maxDevices: number;
    registeredDevices: number;
  } | null;
  devices: Array<{
    id: string;
    name: string;
    lastUsed: string;
    location: string;
  }>;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && session?.user?.email) {
      fetchUserData();
    }
  }, [status, session, router]);

  const fetchUserData = async () => {
    try {
      // Temporary mock data - replace with actual API calls
      setUserData({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        companyName: "Demo Casino",
        cui: "RO12345678",
        subscription: {
          currentPlan: "Professional",
          status: "active",
          nextBillingDate: "2024-04-01",
          maxDevices: 5,
          registeredDevices: 3,
        },
        devices: [
          {
            id: "1",
            name: "Main Reception",
            lastUsed: "2024-03-14",
            location: "Bucharest",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PreLoader />;
  }

  if (error) {
    return (
      <div className="container">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative z-10 overflow-hidden bg-gray-1 pt-[120px] pb-[100px] dark:bg-dark-2 md:pt-[130px] lg:pt-[160px]">
      <div className="container mx-auto px-4">
        <DashboardHeader />
        {userData && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <QuickActions />
            <AccountCard userData={userData} />
            <SubscriptionCard subscription={userData.subscription} />
            <DeviceCard
              devices={userData.devices}
              subscription={userData.subscription}
            />
          </div>
        )}
      </div>
    </section>
  );
} 