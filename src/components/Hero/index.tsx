import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
      <section
        id="home"
        className="relative overflow-hidden bg-primary pt-[120px] md:pt-[130px] lg:pt-[160px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
                data-wow-delay=".2s"
              >
                <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
                Advanced ID Verification & Self-Exclusion Management for Romanian Casinos
                </h1>
                <p className="mx-auto mb-9 max-w-[600px] text-base font-medium text-white sm:text-lg sm:leading-[1.44]">
                Streamline your compliance process, enhance security, and manage self-exclusions effortlessly with our comprehensive SaaS solution tailored for Romanian casinos.
                </p>
                <ul className="mb-10 flex flex-wrap items-center justify-center gap-5">
                  <li>
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-center text-base font-medium text-primary transition duration-300 hover:bg-primary/90 hover:text-white"
                  >
                    Get Started
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="flex items-center gap-4 rounded-md bg-white/[0.12] px-6 py-3 text-base font-medium text-white transition hover:bg-white hover:text-primary"
                  >
                    Learn More
                  </a>
                </li>
              </ul>
            </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Hero;
