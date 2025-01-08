import React from "react";
import ResetPassword from "@/components/Auth/ResetPassword";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ScanPro",
};

interface PageProps {
  params: {
    token: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ResetPasswordPage({ 
  params,
  searchParams 
}: PageProps) {
  return (
    <>
      <Breadcrumb pageName="Reset Password" />
      <ResetPassword token={params.token} />
    </>
  );
}
