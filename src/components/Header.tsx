import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-stroke bg-white dark:border-dark-3 dark:bg-dark">
      <div className="container mx-auto">
        <div className="relative -mx-4 flex items-center justify-between">
          <div className="w-60 max-w-full px-4">
            <Link href="/" className="block w-full py-5">
              <Image
                src="/images/logo/logo-white.svg"
                alt="Logo"
                width={150}
                height={40}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%'
                }}
                priority
              />
            </Link>
          </div>
          
          {/* Rest of the header content */}
        </div>
      </div>
    </header>
  );
} 