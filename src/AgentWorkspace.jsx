import React, { useEffect, useState, useRef } from "react";

const AgentWorkspace = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔒 Tracks whether this contact is still active
  const isContactActiveRef = useRef(true);

  useEffect(() => {
    connect.contact((contact) => {
      console.log("📞 Contact detected");

      let fetched = false;
      isContactActiveRef.current = true;

      const fetchCustomer = () => {
        // ❌ HARD STOP after call ends
        if (!isContactActiveRef.current) {
          console.warn("Ignoring refresh after call ended");
          return;
        }

        const attributes = contact.getAttributes();
        console.log("🔄 Refreshed attributes:", attributes);

        const customerId = attributes?.customerId?.value;

        if (!customerId || fetched) return;

        fetched = true;
        setLoading(true);

        fetch(`http://localhost:3001/api/customers/${customerId}`)
          .then((res) => res.json())
          .then((data) => {
            if (!isContactActiveRef.current) return;
            setCustomer(data);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      };

      // Safe fetch points
      contact.onConnected(fetchCustomer);
      contact.onRefresh(fetchCustomer);

      // ✅ FINAL CLEANUP
      contact.onEnded(() => {
        console.log("❌ Call ended – clearing customer data");
        isContactActiveRef.current = false;
        fetched = false;
        setCustomer(null);
        setLoading(false);
      });
    });
  }, []);

  return (
    <div style={{ padding: "15px", border: "1px solid #ccc", width: "300px" }}>
      <h3>👤 Customer Info</h3>

      {loading && <p>Loading...</p>}

      {customer && (
        <>
          <p><strong>Name:</strong> {customer.name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Plan:</strong> {customer.plan}</p>
        </>
      )}

      {!loading && !customer && <p>No customer selected</p>}
    </div>
  );
};

export default AgentWorkspace;
