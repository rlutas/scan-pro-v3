import Image from "next/image";

const About = () => {
  return (
    <section
      id="about"
      className="bg-gray-1 pb-8 pt-20 dark:bg-dark-2 lg:pb-[70px] lg:pt-[120px]"
    >
      <div className="container">
        <div className="wow fadeInUp" data-wow-delay=".2s">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4 lg:w-1/2">
              <div className="mb-12 max-w-[540px] lg:mb-0">
                <h2 className="mb-5 text-3xl font-bold leading-tight text-dark dark:text-white sm:text-[40px] sm:leading-[1.2]">
                  Streamline Casino Compliance with Advanced Technology
                </h2>
                <p className="mb-10 text-base leading-relaxed text-body-color dark:text-dark-6">
                  ScanPro revolutionizes how Romanian casinos handle ID verification 
                  and self-exclusion management. Our platform combines advanced OCR 
                  technology with real-time ONJN database integration to ensure 
                  complete compliance and enhanced security.
                  <br /> <br />
                  With features like instant ID validation, automated self-exclusion 
                  checks, and comprehensive digital record-keeping, ScanPro helps 
                  you maintain regulatory compliance while improving operational 
                  efficiency.
                </p>

                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3 text-center text-base font-medium text-white duration-300 hover:bg-primary/90"
                >
                  Schedule Demo
                </a>
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2">
              <div className="wow fadeInUp relative mx-auto aspect-[25/24] max-w-[500px] lg:mr-0">
                {/* Add relevant image showing the app in action */}
                <img
                  src="/images/about/about-image.jpg"
                  alt="ID scanning and verification process"
                  className="mx-auto max-w-full rounded-md lg:mr-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
