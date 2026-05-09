import { X } from "lucide-react";

const CreateTicketModal = ({ open, setOpen }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">

      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 relative">

        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-5 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-4xl font-bold gradient-text mb-8">
          Create Ticket
        </h2>

        <form className="space-y-6">

          <div>
            <label className="block mb-2 text-gray-300">
              Issue Title
            </label>

            <input
              type="text"
              placeholder="Enter issue title"
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Category
            </label>

            <select className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500">

              <option>Technical</option>
              <option>Payment</option>
              <option>Booking</option>
              <option>Support</option>

            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Priority
            </label>

            <select className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500">

              <option>Low</option>
              <option>Medium</option>
              <option>High</option>

            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Description
            </label>

            <textarea
              rows="5"
              placeholder="Describe your issue..."
              className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
            ></textarea>
          </div>

          <button className="primary-btn w-full">
            Submit Ticket
          </button>

        </form>

      </div>
    </div>
  );
};

export default CreateTicketModal;