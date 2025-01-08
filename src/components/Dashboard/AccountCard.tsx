"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface UserData {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  cui: string | null;
}

const AccountCard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-dark-3" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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

  if (error || !userData) {
    return (
      <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
        <div className="text-center text-red-500">
          {error || "Failed to load account details"}
        </div>
      </div>
    );
  }

  return (
    <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Account Details
        </h2>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
          <p className="text-sm font-medium text-body-color">Name</p>
          <p className="mt-2 text-lg font-semibold text-black dark:text-white">
            {userData?.name || "Not provided"}
          </p>
        </div>

        <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
          <p className="text-sm font-medium text-body-color">Email</p>
          <p className="mt-2 text-lg font-semibold text-black dark:text-white">
            {userData?.email}
          </p>
        </div>

        <div className="rounded-lg border border-stroke bg-gray-1 p-4 dark:border-dark-3 dark:bg-dark-3">
          <p className="text-sm font-medium text-body-color">Company</p>
          <p className="mt-2 text-lg font-semibold text-black dark:text-white">
            {userData?.companyName || "Not provided"}
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/profile"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-base font-medium text-white transition duration-300 ease-in-out hover:bg-primary/90"
          >
            Edit Account Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountCard; 