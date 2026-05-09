const PrivacyPolicy = () => {
  return (
    <section className="py-24">
      <div className="container-custom max-w-5xl">
        
        <h1 className="text-5xl font-bold mb-10 gradient-text">
          Privacy Policy
        </h1>

        <div className="space-y-8 text-gray-300 leading-8">
          
          <p>
            CollabX values your privacy and is committed to protecting
            your personal information. This Privacy Policy explains how
            we collect, use and safeguard your data while using our
            platform.
          </p>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Information Collection
            </h2>

            <p>
              We may collect information including name, email address,
              login credentials, ticket data, chat interactions and
              payment references to improve platform functionality.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Data Usage
            </h2>

            <p>
              Collected information is used for authentication,
              chatbot processing, analytics, customer support and
              improving system performance.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Security
            </h2>

            <p>
              We implement secure authentication and encrypted
              communication mechanisms to protect user data and
              transactions.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;