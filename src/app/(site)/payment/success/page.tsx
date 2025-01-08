"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PaymentSuccess = () => {
  const router = useRouter();
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();
        
        if (data.subscription?.status === 'active') {
          setSubscriptionActive(true);
          router.push("/dashboard");
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    // Poll every 2 seconds for subscription status
    const interval = setInterval(checkSubscriptionStatus, 2000);
    
    // Fallback redirect after 10 seconds
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto max-w-[530px] text-center">
              <div className="mx-auto mb-9 text-center">
                <svg
                  className="mx-auto w-full text-center"
                  width="88"
                  height="88"
                  viewBox="0 0 88 88"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="44" cy="44" r="44" className="fill-primary" />
                  <path
                    className="stroke-white"
                    d="M28 42L37.9565 52L60 30"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                Payment Successful!
              </h3>
              <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                {subscriptionActive 
                  ? "Your subscription is now active! Redirecting to dashboard..."
                  : "Thank you for your subscription. We're setting up your account..."}
              </p>
              <Link
                href="/dashboard"
                className="inline-block rounded-md bg-primary px-8 py-3 text-base font-semibold text-white duration-300 hover:bg-primary/80"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess; 