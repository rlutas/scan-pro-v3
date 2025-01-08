"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";
import Link from "next/link";

interface ProfileDetailsProps {
  profile: {
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
  } | null;
  onProfileUpdate: () => void;
}

const ProfileDetails = ({ profile, onProfileUpdate }: ProfileDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    companyName: profile?.companyName || "",
    cui: profile?.cui || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
      onProfileUpdate();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const renderSubscriptionStatus = () => {
    if (!profile?.subscription) return null;

    return (
      <div className="mb-8 rounded-lg border border-stroke p-6 dark:border-dark-3">
        <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
          Subscription Status
        </h3>
        
        {profile.subscription.hasSubscription ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-body-color">Plan</p>
              <p className="text-base font-semibold text-black dark:text-white">
                {profile.subscription.plan}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-body-color">Status</p>
              <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                profile.subscription.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-500"
                  : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-500"
              }`}>
                {profile.subscription.status}
              </div>
            </div>

            {profile.subscription.maxDevices && (
              <div>
                <p className="text-sm font-medium text-body-color">Device Limit</p>
                <p className="text-base font-semibold text-black dark:text-white">
                  {profile.subscription.maxDevices} devices
                </p>
              </div>
            )}

            {profile.subscription.nextBillingDate && (
              <div>
                <p className="text-sm font-medium text-body-color">Next Billing Date</p>
                <p className="text-base font-semibold text-black dark:text-white">
                  {new Date(profile.subscription.nextBillingDate).toLocaleDateString()}
                </p>
              </div>
            )}

            <Link
              href="/subscription"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-primary/90"
            >
              Manage Subscription
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-body-color">
              You don't have an active subscription plan.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-primary/90"
            >
              View Plans
            </Link>
          </div>
        )}
      </div>
    );
  };

  if (!profile) return null;

  return (
    <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Profile Details
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white hover:bg-primary/90"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={isEditing ? formData.name : profile.name || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
            />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={profile.email || ""}
              disabled
              className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
            />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              placeholder="Company Name"
              value={isEditing ? formData.companyName : profile.companyName || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
            />
          </div>

          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-dark dark:text-white">
              CUI (Company Registration Number)
            </label>
            <input
              type="text"
              name="cui"
              placeholder="Romanian Company Registration Number"
              value={isEditing ? formData.cui : profile.cui || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full rounded-md border border-transparent px-6 py-3 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp"
            />
          </div>

          {renderSubscriptionStatus()}
        </div>

        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profile.name || "",
                  companyName: profile.companyName || "",
                  cui: profile.cui || "",
                });
              }}
              className="rounded-md border border-primary bg-transparent px-6 py-3 text-base font-medium text-primary transition hover:bg-primary hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-white transition hover:bg-primary/90 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex items-center">
                  <span className="mr-2">Saving</span>
                  <Loader />
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileDetails; 