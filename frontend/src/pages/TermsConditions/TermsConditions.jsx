const TermsConditions = () => {
  return (
    <section className="py-24">
      <div className="container-custom max-w-5xl">

        <h1 className="text-5xl font-bold mb-10 gradient-text">
          Terms & Conditions
        </h1>

        <div className="space-y-8 text-gray-300 leading-8">

          <p>
            By accessing and using CollabX, users agree to comply with
            all platform policies, security guidelines and operational
            procedures.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              User Responsibilities
            </h2>

            <p>
              Users must provide accurate information and avoid misuse
              of chatbot systems, ticket workflows or payment features.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Platform Availability
            </h2>

            <p>
              CollabX reserves the right to modify or discontinue
              services temporarily for maintenance and upgrades.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Limitation of Liability
            </h2>

            <p>
              The platform is provided as a prototype/demo system and
              does not guarantee uninterrupted or error-free operation.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TermsConditions;