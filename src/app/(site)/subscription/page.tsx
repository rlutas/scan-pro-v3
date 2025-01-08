"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import PreLoader from "@/components/Common/PreLoader";
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from "@/config/subscriptionPlans";
import toast from "react-hot-toast";

interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  maxDevices: number;
  nextBillingDate: string | null;
  startDate: string;
  stripeCustomerId: string | null;
  devices: {
    total: number;
    active: number;
  };
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated") {
      fetchSubscription();
    }
  }, [status, router]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/user/subscription");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch subscription");
      }
      const { data } = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planName: string) => {
    try {
      const plan = SUBSCRIPTION_PLANS[planName as keyof typeof SUBSCRIPTION_PLANS];
      if (!plan) {
        throw new Error("Invalid subscription plan selected");
      }

      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          planName: plan.name
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate upgrade");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to initiate plan upgrade");
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    
    try {
      const response = await fetch("/api/user/subscription/cancel", {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to cancel subscription");
      
      toast.success("Subscription cancelled successfully");
      fetchSubscription();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  if (loading) return <PreLoader />;

  return (
    <>
      <Breadcrumb pageName="Subscription Management" />
      <div className="relative z-10 overflow-hidden bg-white px-4 pt-10 pb-16 dark:bg-dark lg:px-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Your Subscription
            </h1>
          </div>

          {subscription ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Current Plan Details */}
              <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
                <h2 className="mb-5 text-2xl font-bold text-black dark:text-white">
                  Current Plan
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-body-color">Plan</p>
                    <p className="text-xl font-semibold text-black dark:text-white">
                      {subscription.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-body-color">Status</p>
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-500"
                        : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-500"
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-body-color">Device Usage</p>
                    <p className="text-xl font-semibold text-black dark:text-white">
                      {subscription.devices.active}/{subscription.maxDevices} devices
                    </p>
                  </div>
                  {subscription.nextBillingDate && (
                    <div>
                      <p className="text-sm font-medium text-body-color">Next Billing Date</p>
                      <p className="text-base text-black dark:text-white">
                        {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-body-color">Started On</p>
                    <p className="text-base text-black dark:text-white">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {subscription.status === "active" && (
                  <button
                    onClick={handleCancel}
                    className="mt-6 w-full rounded-md border border-red-500 bg-transparent px-6 py-3 text-base font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>

              {/* Available Plans */}
              <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
                <h2 className="mb-5 text-2xl font-bold text-black dark:text-white">
                  Available Plans
                </h2>
                <div className="space-y-4">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <div
                      key={key}
                      className="rounded-lg border border-stroke p-4 dark:border-dark-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-black dark:text-white">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-body-color">
                            Up to {plan.maxDevices} devices
                          </p>
                        </div>
                        {subscription?.plan !== plan.name && (
                          <button
                            onClick={() => handleUpgrade(key)}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-lg text-body-color">
                You don't have an active subscription.
              </p>
              <button
                onClick={() => router.push("/pricing")}
                className="rounded-md bg-primary px-6 py-3 text-base font-medium text-white hover:bg-primary/90"
              >
                View Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 