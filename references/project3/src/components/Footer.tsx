import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-primary transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          © 2025 Provo Student Housing Swap. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
