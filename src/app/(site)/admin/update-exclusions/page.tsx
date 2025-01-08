"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { ExclusionListUploader } from "@/components/admin/ExclusionListUploader";
import PreLoader from "@/components/Common/PreLoader";

// Define custom session type
interface CustomSession {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export default function UpdateExclusionsPage() {
  const { data: session, status } = useSession() as { 
    data: CustomSession | null;
    status: "loading" | "authenticated" | "unauthenticated";
  };
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    } else if (status === "authenticated" && (!session?.user?.role || session.user.role !== "ADMIN")) {
      router.push("/");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <PreLoader />;
  }

  if (status === "unauthenticated" || !session?.user?.role || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      <Breadcrumb pageName="Update Exclusions List" />
      <div className="relative z-10 overflow-hidden bg-white px-4 pt-10 pb-16 dark:bg-dark lg:px-8">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Update Exclusions List
            </h1>
            <p className="mt-4 text-base text-body-color dark:text-dark-6">
              Upload a new exclusion list in CSV format. The system will automatically process and update the database.
            </p>
          </div>
          
          <div className="max-w-2xl">
            <ExclusionListUploader />
          </div>
        </div>
      </div>
    </>
  );
} 