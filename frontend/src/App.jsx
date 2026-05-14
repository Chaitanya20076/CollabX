import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import IntroSplash from "./pages/IntroSplash/IntroSplash";

const INTRO_SEEN_KEY = "collabx-intro-seen";

const App = () => {
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem(INTRO_SEEN_KEY)
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
      <AppRoutes />
    </>
  );
};

export default App;
