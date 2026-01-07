import { useEffect, useRef, useState } from "react";

const CustomCCP = () => {
  const initializedRef = useRef(false);
  const contactRef = useRef(null);

  const [callState, setCallState] = useState("IDLE");
  const [callerNumber, setCallerNumber] = useState("—");
  const [isOnHold, setIsOnHold] = useState(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 1️⃣ Initialize CCP (required even for custom UI)
    connect.core.initCCP(
      document.getElementById("ccp-container"),
      {
        ccpUrl: "https://p3f-learn.my.connect.aws/ccp-v2",
        loginPopup: true,
        softphone: { allowFramedSoftphone: true }
      }
    );

    // 2️⃣ Listen for incoming contacts
    connect.contact((contact) => {
      console.log("📞 Incoming contact");
      contactRef.current = contact;

      const number =
        contact.getInitialConnection()
          ?.getEndpoint()
          ?.phoneNumber || "Unknown";

      setCallerNumber(number);
      setCallState("INCOMING");

      contact.onConnected(() => {
        console.log("🟢 Call connected");
        setCallState("CONNECTED");
      });

      contact.onEnded(() => {
        console.log("❌ Call ended");
        setCallState("IDLE");
        setCallerNumber("—");
        setIsOnHold(false);
        contactRef.current = null;
      });
    });
  }, []);

  // ---------- Custom Controls (EXPERIMENTAL) ----------

  const acceptCall = () => {
    contactRef.current?.accept();
  };

  const endCall = () => {
  const connection = contactRef.current?.getActiveInitialConnection();
  connection?.destroy();
};

  const declineCall = () => {
    const contact = contactRef.current;
    if (!contact) return;

    // ⚠️ Hack: accept then immediately hang up
    contact.accept();
    setTimeout(() => {
      contact.getActiveInitialConnection()?.destroy();
    }, 300);
  };

  const holdCall = () => {
    contactRef.current
      ?.getActiveInitialConnection()
      ?.hold();
    setIsOnHold(true);
  };

  const resumeCall = () => {
    contactRef.current
      ?.getActiveInitialConnection()
      ?.resume();
    setIsOnHold(false);
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      
      {/* CCP iframe (can be hidden if you want) */}
      <div
        id="ccp-container"
        style={{ width: "320px", height: "460px", border: "1px solid #ccc", display: "none" }}
      />

      {/* Custom CCP UI */}
      <div style={{ padding: "20px", width: "300px", border: "1px solid #ccc" }}>
        <h2>Custom CCP</h2>

        <p><strong>Caller:</strong> {callerNumber}</p>
        <p><strong>Status:</strong> {callState}</p>

        {callState === "INCOMING" && (
          <>
            <button onClick={acceptCall}>✅ Accept</button>
            <button onClick={declineCall}>❌ Decline</button>
          </>
        )}

        {callState === "CONNECTED" && (
          <>
            <button onClick={isOnHold ? resumeCall : holdCall}>
              {isOnHold ? "▶️ Resume" : "⏸️ Hold"}
            </button>
            
            <button onClick={endCall} className="btn btn-red">
            🔴 End Call
            </button>

          </>
        )}
      </div>
    </div>
  );
};

export default CustomCCP;
