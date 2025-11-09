import { Code } from "lucide-react";
import Link from "next/link";
import React from "react";
import { FaGithub } from "react-icons/fa";

const Header = () => {
  return (
    <header className=" border-black bg-white ">
      <div className="container mx-auto px-4 md:px-16 lg:px-24 py-4 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-xl sm:text-3xl font-bold text-foreground cursor-pointer"
            >
              VTRACE
            </Link>
          </div>
          <nav className="flex items-center space-x-12">
            <Link
              href="/"
              className="hidden md:block text-primary scale-[2] hover:text-foreground transition-colors"
            >
              <FaGithub />
            </Link>
            <Link
              href="/visualizers"
              className="relative text-white font-semibold px-8 py-2.5 rounded-2xl text-md border-4 border-black transition-all ease-in-out duration-300"
            >
              <span className="opacity-0">Start Visualise</span>
              <div className="absolute inset-0 text-center py-2 h-[120%] w-[106%] border-2 bg-black rounded-2xl z-10 -top-2 -left-2 hover:-top-[4px] hover:-left-1">
                <span className="relative top-1" >Start Visualise</span>
              </div>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
