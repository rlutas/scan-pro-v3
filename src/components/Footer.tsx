import Image from 'next/image';

export function Footer() {
  return (
    <footer>
      {/* ... other footer content ... */}
      <Image 
        src="/images/footer/shape-3.svg" 
        alt="Footer shape"
        width={500}  // adjust based on your actual image size
        height={300} // adjust based on your actual image size
        priority     // add priority for LCP image
        className="absolute ..." // your existing classes
      />
      {/* ... other footer content ... */}
    </footer>
  );
} 