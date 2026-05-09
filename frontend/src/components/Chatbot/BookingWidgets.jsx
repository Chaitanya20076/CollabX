import { useState } from "react";

export const MCQWidget = ({ options, onSelect }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      {options.map((opt, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(opt)}
          className="bg-[#2a2a2a] hover:bg-blue-600 border border-gray-700 rounded-xl px-4 py-2 text-sm text-left transition-colors"
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

export const SeatSelectionWidget = ({ mode = 'movie', onConfirm }) => {
  const [selected, setSelected] = useState([]);
  
  const getLayoutConfig = (m) => {
    switch (m) {
      case 'flight':
        return {
          rows: ['1', '2', '3', '4', '5', '6', '7', '8'],
          cols: ['A', 'B', 'C', 'GAP', 'D', 'E', 'F'],
          pricePerSeat: 4500,
          label: "Cockpit / Front"
        };
      case 'movie':
      default:
        return {
          rows: ['A', 'B', 'C', 'D', 'E', 'F'],
          cols: ['1', '2', '3', '4', 'GAP', '5', '6', '7', '8'],
          pricePerSeat: 250,
          label: "Screen / Stage"
        };
    }
  };

  const config = getLayoutConfig(mode);

  // Fake state for occupied seats generated once per component mount
  const [occupiedSeats] = useState(() => {
    const occupied = [];
    config.rows.forEach(r => {
      config.cols.forEach(c => {
        if (c !== 'GAP' && Math.random() > 0.7) occupied.push(`${r}${c}`); // 30% chance occupied
      });
    });
    return occupied;
  });

  const toggleSeat = (seat) => {
    if (occupiedSeats.includes(seat)) return;
    if (selected.includes(seat)) {
      setSelected(selected.filter(s => s !== seat));
    } else {
      setSelected([...selected, seat]);
    }
  };

  return (
    <div className="mt-3 bg-[#1e1e1e] p-4 rounded-xl border border-gray-700 shadow-xl w-full max-w-full">
      <div className="text-center mb-4">
        <div className="w-3/4 h-2 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] mb-1"></div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{config.label}</p>
      </div>
      
      <div className="flex flex-col gap-2 mb-4 items-center">
        {config.rows.map(row => (
          <div key={row} className="flex gap-1 sm:gap-2">
            {config.cols.map((col, idx) => {
              if (col === 'GAP') {
                return <div key={`gap-${row}-${idx}`} className="w-2 sm:w-4"></div>;
              }
              const seat = mode === 'flight' ? `${row}${col}` : `${row}${col}`; // Just combining row+col
              const isSelected = selected.includes(seat);
              const isOccupied = occupiedSeats.includes(seat);
              return (
                <button
                  key={seat}
                  onClick={() => toggleSeat(seat)}
                  disabled={isOccupied}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-t-lg rounded-b-sm text-[8px] sm:text-[10px] font-bold flex items-center justify-center transition-all duration-200 ${
                    isOccupied 
                      ? 'bg-[#111111] text-gray-600 cursor-not-allowed border border-gray-800'
                      : isSelected 
                      ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)] transform scale-110 border border-blue-400' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-600 hover:text-white border border-gray-700'
                  }`}
                >
                  {isOccupied ? 'X' : seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-4 text-sm bg-black/30 p-2 rounded-lg">
        <span className="text-gray-300">Selected: <span className="text-white font-bold">{selected.length}</span></span>
        <span className="text-gray-300">Total: <span className="text-blue-400 font-bold">₹{selected.length * config.pricePerSeat}</span></span>
      </div>

      <button
        onClick={() => onConfirm(selected, selected.length * config.pricePerSeat)}
        disabled={selected.length === 0}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg active:scale-95"
      >
        Confirm Seats
      </button>
    </div>
  );
};

export const SummaryWidget = ({ details, onContinue }) => {
  return (
    <div className="mt-2 bg-[#2a2a2a] p-4 rounded-xl border border-gray-700">
      <h3 className="font-semibold text-white mb-3">Booking Summary</h3>
      <div className="space-y-2 mb-4">
        {details.map((detail, idx) => (
          <div key={idx} className="text-sm text-gray-300 flex justify-between">
            <span>{detail}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onContinue}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Continue to Payment
      </button>
    </div>
  );
};
