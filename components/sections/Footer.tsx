import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="!bg-[#005AE1] !text-white !py-12 !px-6">
      <div className="!max-w-6xl !mx-auto">
        <div className="!grid !grid-cols-1 md:!grid-cols-3 !gap-8 !mb-8">
          {/* Column 1: About */}
          <div>
            <div className="!flex !items-center !gap-3 !mb-4">
              <Image src="/logo.png" alt="HAWA" width={32} height={32} />
              <h3 className="!text-2xl !font-bold">HAWA</h3>
            </div>
            <p className="!text-white/80 !leading-relaxed">
              Platform monitoring kualitas udara berbasis IoT dan AI untuk masyarakat Bandung
            </p>
          </div>

          {/* Column 2: Links */}
          <div>
            <h4 className="!text-lg !font-bold !mb-4">Quick Links</h4>
            <ul className="!space-y-2">
              <li>
                <a href="#features" className="!text-white/80 hover:!text-white !transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="!text-white/80 hover:!text-white !transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#about-us" className="!text-white/80 hover:!text-white !transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <Link href="/map" className="!text-white/80 hover:!text-white !transition-colors">
                  Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h4 className="!text-lg !font-bold !mb-4">Contact</h4>
            <ul className="!space-y-2 !text-white/80">
              <li>📧 info@hawa.id</li>
              <li>📍 Bandung, Indonesia</li>
              <li className="!flex !gap-3 !mt-4">
                <a href="#" className="hover:!text-white !transition-colors">Twitter</a>
                <a href="#" className="hover:!text-white !transition-colors">Instagram</a>
                <a href="#" className="hover:!text-white !transition-colors">Facebook</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="!border-t !border-white/20 !pt-6 !text-center !text-white/60 !text-sm">
          © 2026 HAWA. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
