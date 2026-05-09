import {
  Film,
  Plane,
  Car,
  Bus,
  Hotel,
  Music,
  Ticket,
  CheckCircle2,
  Percent,
} from "lucide-react";

const Pricing = () => {
  const services = [
    {
      icon: <Film size={42} />,
      title: "Movie Ticketing",
      fee: "2%",
      desc: "Low platform fee for cinema and entertainment ticket bookings.",
      color: "text-red-500",
    },
    {
      icon: <Plane size={42} />,
      title: "Flight Booking",
      fee: "5%",
      desc: "Advanced workflow fee for airline and travel reservation systems.",
      color: "text-blue-500",
    },
    {
      icon: <Car size={42} />,
      title: "Car Rentals",
      fee: "4%",
      desc: "Vehicle rental workflow automation and booking management.",
      color: "text-green-500",
    },
    {
      icon: <Bus size={42} />,
      title: "Bus Ticketing",
      fee: "3%",
      desc: "Affordable platform fee for public transport and bus ticket systems.",
      color: "text-yellow-500",
    },
    {
      icon: <Hotel size={42} />,
      title: "Hotel Booking",
      fee: "6%",
      desc: "Hotel and accommodation management with secure payment workflows.",
      color: "text-purple-500",
    },
    {
      icon: <Music size={42} />,
      title: "Concert & Events",
      fee: "7%",
      desc: "Event ticketing workflows with realtime booking automation.",
      color: "text-pink-500",
    },
  ];

  const benefits = [
    "Transparent service-based pricing",
    "Scalable transaction workflows",
    "Realtime AI automation support",
    "Secure payment integrations",
    "Cloud scalable infrastructure",
    "Custom enterprise onboarding",
  ];

  return (
    <>
      {/* HERO SECTION */}

      <section className="relative overflow-hidden py-28">

        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent"></div>

        <div className="container-custom relative z-10 text-center max-w-5xl">

          <div className="inline-flex items-center gap-3 border border-blue-500/30 bg-blue-500/10 px-5 py-2 rounded-full text-blue-400 mb-8">
            <Percent size={18} />
            Service Based Platform Pricing
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-10">
            Flexible{" "}
            <span className="gradient-text">
              Pricing
            </span>{" "}
            Model
          </h1>

          <p className="text-gray-400 text-lg leading-9 max-w-4xl mx-auto">
            CollabX follows a service based platform fee structure
            where pricing varies depending on the type of booking,
            support workflow or ticketing ecosystem integrated into
            the platform.
          </p>

        </div>

      </section>

      {/* SERVICE PRICING */}

      <section className="py-24">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Service Based Pricing
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Different workflows and industries use different platform
              fee percentages depending on operational complexity.
            </p>

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

            {services.map((service, index) => (
              <div
                key={index}
                className="bg-[#0a0a0a] border border-gray-800 rounded-[40px] p-10 hover:border-blue-500 transition duration-300"
              >

                <div className={`${service.color} mb-8`}>
                  {service.icon}
                </div>

                <h3 className="text-3xl font-bold mb-4">
                  {service.title}
                </h3>

                <div className="flex items-end gap-3 mb-6">

                  <h2 className="text-6xl font-bold gradient-text">
                    {service.fee}
                  </h2>

                  <span className="text-gray-400 text-lg mb-2">
                    Platform Fee
                  </span>

                </div>

                <p className="text-gray-400 leading-8">
                  {service.desc}
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="py-28 bg-[#050505]">

        <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

          <div>

            <h2 className="text-5xl font-bold mb-8 gradient-text">
              How Pricing Works
            </h2>

            <p className="text-gray-400 text-lg leading-9 mb-10">
              Platform fees are automatically calculated depending
              on the service category selected by the user during
              ticketing or booking workflows.
            </p>

            <div className="space-y-8">

              <div className="flex items-start gap-5">

                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                  1
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    User Selects Service
                  </h3>

                  <p className="text-gray-400 leading-7">
                    Example: Movie booking, flight reservation or hotel booking.
                  </p>
                </div>

              </div>

              <div className="flex items-start gap-5">

                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-lg">
                  2
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    System Detects Pricing Tier
                  </h3>

                  <p className="text-gray-400 leading-7">
                    Platform fee percentage is automatically applied.
                  </p>
                </div>

              </div>

              <div className="flex items-start gap-5">

                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center font-bold text-lg">
                  3
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Secure Payment Processing
                  </h3>

                  <p className="text-gray-400 leading-7">
                    Final amount and platform fee are processed securely.
                  </p>
                </div>

              </div>

            </div>

          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-[1px]">

            <div className="bg-black rounded-[40px] p-10">

              <h3 className="text-4xl font-bold mb-10">
                Pricing Benefits
              </h3>

              <div className="space-y-8">

                {benefits.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-5 border-b border-gray-800 pb-5"
                  >

                    <CheckCircle2 className="text-green-500" />

                    <p className="text-lg text-gray-300">
                      {item}
                    </p>

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* EXAMPLE SECTION */}

      <section className="py-28">

        <div className="container-custom">

          <div className="text-center mb-20">

            <h2 className="text-5xl font-bold mb-6 gradient-text">
              Example Transactions
            </h2>

            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-8">
              Example breakdown of service transactions and platform fees.
            </p>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-10">

              <h3 className="text-3xl font-bold mb-8 text-red-500">
                Movie Booking
              </h3>

              <div className="space-y-5">

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Ticket Amount
                  </span>

                  <span className="text-2xl font-bold">
                    ₹500
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Platform Fee (2%)
                  </span>

                  <span className="text-2xl font-bold text-green-500">
                    ₹10
                  </span>
                </div>

              </div>

            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-10">

              <h3 className="text-3xl font-bold mb-8 text-blue-500">
                Flight Booking
              </h3>

              <div className="space-y-5">

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Ticket Amount
                  </span>

                  <span className="text-2xl font-bold">
                    ₹10,000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Platform Fee (5%)
                  </span>

                  <span className="text-2xl font-bold text-green-500">
                    ₹500
                  </span>
                </div>

              </div>

            </div>

            <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-10">

              <h3 className="text-3xl font-bold mb-8 text-purple-500">
                Hotel Booking
              </h3>

              <div className="space-y-5">

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Booking Amount
                  </span>

                  <span className="text-2xl font-bold">
                    ₹20,000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    Platform Fee (6%)
                  </span>

                  <span className="text-2xl font-bold text-green-500">
                    ₹1200
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    </>
  );
};

export default Pricing;