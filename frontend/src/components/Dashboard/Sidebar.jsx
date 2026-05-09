import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  Bot,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    {
      title: "Overview",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      title: "Tickets",
      icon: <Ticket size={20} />,
      path: "/dashboard",
    },
    {
      title: "AI Chatbot",
      icon: <Bot size={20} />,
      path: "/dashboard",
    },
    {
      title: "Payments",
      icon: <CreditCard size={20} />,
      path: "/dashboard",
    },
    {
      title: "Settings",
      icon: <Settings size={20} />,
      path: "/dashboard",
    },
  ];

  return (
    <aside className="w-full md:w-[280px] bg-[#0a0a0a] border-r border-gray-800 p-6">

      <h2 className="text-3xl font-bold gradient-text mb-12">
        CollabX
      </h2>

      <div className="flex flex-col gap-3">

        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-blue-600/10 hover:text-blue-400 transition"
          >
            {item.icon}
            {item.title}
          </NavLink>
        ))}

      </div>

      <button className="mt-12 flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-red-600/10 hover:text-red-400 transition w-full">
        <LogOut size={20} />
        Logout
      </button>

    </aside>
  );
};

export default Sidebar;