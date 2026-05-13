import { useEffect, useState } from "react";

import "./IntroSplash.css";

const INTRO_DURATION_MS = 14000;

const IntroSplash = ({ onComplete }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => {
      setIsLeaving(true);
    }, INTRO_DURATION_MS - 700);

    const completeTimer = window.setTimeout(() => {
      onComplete();
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const finishIntro = () => {
    setIsLeaving(true);
    window.setTimeout(onComplete, 280);
  };

  return (
    <div className={`intro-splash${isLeaving ? " intro-splash--leaving" : ""}`}>
      <button className="intro-splash__skip" type="button" onClick={finishIntro}>
        Skip
      </button>

      <div className="intro-splash__scene" aria-label="CollabX introduction">
        <div className="intro-splash__ticket">
          <div className="intro-splash__ticket-header">
            <span>Access Terminal</span>
            <span>Bengaluru // 2026</span>
          </div>

          <div className="intro-splash__ticket-footer">
            <div className="intro-splash__barcode" />
            <div className="intro-splash__protocol">
              PROTOCOL: COLLAB_X_7
              <br />
              SECURE_HANDSHAKE_OK
            </div>
          </div>
        </div>

        <div className="intro-splash__brand" aria-hidden="true">
          <span className="intro-splash__collab">Collab</span>
          <span className="intro-splash__x">X</span>
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;
