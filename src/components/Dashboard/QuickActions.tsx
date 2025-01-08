import Link from "next/link";

const QuickActions = () => {
  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-3">
      <div className="wow fadeInUp rounded-md bg-white px-8 py-8 shadow-one dark:bg-dark-2 sm:px-10 sm:py-8">
        <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-stroke bg-gray-1 p-4 transition-all hover:bg-gray-2 dark:border-dark-3 dark:bg-dark-3 dark:hover:bg-dark-2">
            <Link
              href="/scan"
              className="flex flex-col items-center space-y-3"
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 7V5C3 3.89543 3.89543 3 5 3H7M17 3H19C20.1046 3 21 3.89543 21 5V7M21 17V19C21 20.1046 20.1046 21 19 21H17M7 21H5C3.89543 21 3 20.1046 3 19V17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black dark:text-white">Start ID Scanning</span>
              <p className="text-center text-sm text-body-color">Scan and verify IDs quickly and securely</p>
            </Link>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-1 p-4 transition-all hover:bg-gray-2 dark:border-dark-3 dark:bg-dark-3 dark:hover:bg-dark-2">
            <Link
              href="/scan-history"
              className="flex flex-col items-center space-y-3"
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black dark:text-white">Scan History</span>
              <p className="text-center text-sm text-body-color">View and manage past ID scans</p>
            </Link>
          </div>

          <div className="rounded-lg border border-stroke bg-gray-1 p-4 transition-all hover:bg-gray-2 dark:border-dark-3 dark:bg-dark-3 dark:hover:bg-dark-2">
            <Link
              href="/self-exclusion"
              className="flex flex-col items-center space-y-3"
            >
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.2222 11.1111C18.2222 15.6333 15.6333 18.2222 11.1111 18.2222C6.58889 18.2222 4 15.6333 4 11.1111C4 6.58889 6.58889 4 11.1111 4C15.6333 4 18.2222 6.58889 18.2222 11.1111Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-black dark:text-white">Self-Exclusion</span>
              <p className="text-center text-sm text-body-color">Manage self-exclusion records</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 