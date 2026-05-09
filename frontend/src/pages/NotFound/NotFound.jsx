import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="text-center">

        <h1 className="text-8xl font-bold gradient-text mb-6">
          404
        </h1>

        <p className="text-gray-400 text-xl mb-8">
          Page not found
        </p>

        <Link to="/" className="primary-btn">
          Back Home
        </Link>

      </div>
    </section>
  );
};

export default NotFound;