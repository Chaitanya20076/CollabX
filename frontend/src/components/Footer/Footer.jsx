import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-gray-800 mt-20">
      <div className="container-custom py-14 grid md:grid-cols-4 gap-10">
        
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-4">
            CollabX
          </h2>

          <p className="text-gray-400 leading-7">
            AI Powered Chatbot Based Ticketing System designed for
            modern customer support and smart automation workflows.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Quick Links
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/workflow">Workflow</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Legal
          </h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">
              Terms & Conditions
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">
            Connect
          </h3>

          <div className="flex items-center gap-5 text-2xl text-gray-400">
            <FaGithub className="hover:text-white transition cursor-pointer" />
            <FaLinkedin className="hover:text-white transition cursor-pointer" />
            <FaInstagram className="hover:text-white transition cursor-pointer" />
            <FaTwitter className="hover:text-white transition cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-gray-500">
        © 2026 CollabX. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;