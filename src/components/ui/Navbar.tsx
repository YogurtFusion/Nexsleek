"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, User } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navbarRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies" },
    { name: "My List", href: "/my-list" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      console.log("Search:", searchQuery);
      setIsSearchExpanded(false);
      setSearchQuery("");
    }
  };

  return (
    <div
      ref={navbarRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-surface"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-accent font-bebas-neue text-2xl tracking-wider hover:opacity-80 transition-opacity">
              NexSleek
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-accent"
                      : "text-text hover:text-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Search and Profile */}
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className={`transition-all duration-300 ${isSearchExpanded ? "w-48" : "w-8"}`}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                  placeholder="Search movies..."
                  className="w-full bg-surface/50 border border-surface rounded-full py-1.5 pl-10 pr-4 text-sm text-text focus:outline-none focus:border-accent focus:bg-surface transition-all placeholder-muted"
                />
              </form>
            </div>

            {/* Profile Dropdown */}
            <div className="relative hidden md:block">
              <button className="flex items-center gap-2 text-text hover:text-accent transition-colors">
                <User size={20} />
                <span className="text-sm font-medium">Profile</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-text hover:text-accent transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-surface animate-in slide-in-from-top-5 fade-in duration-200">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium ${
                    pathname === link.href
                      ? "text-accent"
                      : "text-text hover:text-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-surface">
              <div className="flex items-center gap-3 text-text">
                <User size={20} />
                <span className="text-sm">Sign In</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
