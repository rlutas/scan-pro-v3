import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Cancelled | Play SaaS Starter Kit",
  description: "Payment cancelled page",
};

const PaymentCancel = () => {
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
                  <circle cx="44" cy="44" r="44" className="fill-red-600" />
                  <path
                    className="stroke-white"
                    d="M32 32L56 56M56 32L32 56"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-3xl font-bold text-black dark:text-white sm:text-4xl">
                Payment Cancelled
              </h3>
              <p className="mb-10 text-base font-medium leading-relaxed text-body-color sm:text-lg sm:leading-relaxed">
                Your payment was cancelled. You can try again whenever you're ready.
              </p>
              <Link
                href="/pricing"
                className="inline-block rounded-md bg-primary px-8 py-3 text-base font-semibold text-white duration-300 hover:bg-primary/80"
              >
                Back To Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentCancel; 