"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileDetails from "../../../components/Profile/ProfileDetails";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PreLoader from "@/components/Common/PreLoader";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  cui: string | null;
  subscription: {
    hasSubscription: boolean;
    isActive: boolean;
    plan: string | null;
    status: string;
    maxDevices?: number;
    nextBillingDate?: string | null;
    startDate?: string;
  };
  devices: Array<{
    id: string;
    name: string;
    location: string | null;
    lastUsed: string;
    isActive: boolean;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data. Please try again.");
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
    <>
      <Breadcrumb pageName="Profile" />
      <div className="relative z-10 overflow-hidden bg-[#F4F7FF] pt-[120px] pb-[100px] dark:bg-dark-2 md:pt-[130px] lg:pt-[160px]">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProfileDetails profile={profile} onProfileUpdate={fetchProfile} />
            </div>
            <div className="lg:col-span-1">
              <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
                <h2 className="mb-5 text-2xl font-bold text-black dark:text-white">
                  Connected Devices
                </h2>
                {profile?.devices && profile.devices.length > 0 ? (
                  <div className="space-y-4">
                    {profile.devices.map((device) => (
                      <div
                        key={device.id}
                        className="rounded-lg border border-stroke p-4 dark:border-dark-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-black dark:text-white">
                              {device.name}
                            </h3>
                            {device.location && (
                              <p className="text-sm text-body-color">
                                {device.location}
                              </p>
                            )}
                          </div>
                          <div className={`h-3 w-3 rounded-full ${
                            device.isActive ? "bg-green-500" : "bg-red-500"
                          }`} />
                        </div>
                        <p className="mt-2 text-sm text-body-color">
                          Last used: {new Date(device.lastUsed).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-color">No devices connected yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 