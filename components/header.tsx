import Link from "next/link";
import React from "react";
import { FaGithub } from "react-icons/fa";


const Header = () => {
    return (
        <header className="border-b bg-background transition-colors duration-300">
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
                    <nav className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="hidden md:block text-primary scale-[1.5] hover:text-foreground transition-colors"
                        >
                            <FaGithub />
                        </Link>
                        <Link
                            href="/visualizers"
                            className="relative text-primary-foreground font-semibold px-6 py-2 rounded-xl text-sm border-2 border-primary bg-primary hover:bg-primary/90 transition-all"
                        >
                            Start Visualise
                        </Link>

                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
