"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SubscriptionData {
  currentPlan: string;
  status: string;
  nextBillingDate: string | null;
  maxDevices: number;
  registeredDevices: number;
}

const SubscriptionCard = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/devices");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription");
        }
        const data = await response.json();
        setSubscription({
          currentPlan: data.subscription.plan,
          status: data.subscription.status,
          nextBillingDate: data.subscription.nextBillingDate,
          maxDevices: data.subscription.maxDevices,
          registeredDevices: data.subscription.registeredDevices
        });
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load subscription data");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
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
        <div className="text-center text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Subscription Details
        </h2>
      </div>

      {!subscription ? (
        <div className="text-center">
          <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
            No Active Subscription
          </h3>
          <p className="mb-6 text-base text-body-color">
            Get started by choosing a subscription plan
          </p>
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
          >
            View Plans
          </Link>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
            <p className="text-sm font-medium text-body-color">Current Plan</p>
            <p className="mt-2 text-lg font-semibold text-black dark:text-white">
              {subscription.currentPlan}
            </p>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
            <p className="text-sm font-medium text-body-color">Status</p>
            <div className="mt-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                subscription.status === "active"
                  ? "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-500"
                  : "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-500"
              }`}>
                {subscription.status}
              </span>
            </div>
          </div>

          {subscription.nextBillingDate && (
            <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
              <p className="text-sm font-medium text-body-color">Next Billing Date</p>
              <p className="mt-2 text-lg font-semibold text-black dark:text-white">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="pt-4">
            <Link
              href="/subscription"
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard; 