import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import ChatWidget from "../components/Chatbot/ChatWidget";

const MainLayout = () => {
  const location = useLocation();

  const hideLayout =
  location.pathname === "/dashboard" ||
  location.pathname === "/ai-chat" ||
  location.pathname.startsWith("/payment-confirm");

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">

      {!hideLayout && <Navbar />}

      <main className="flex-grow">
        <Outlet />
      </main>

      {!hideLayout && <Footer />}

      {!hideLayout && <ChatWidget />}

    </div>
  );
};

export default MainLayout;
