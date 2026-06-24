import React from "react";

interface VerificationRejectedProps {
  userName: string;
  prizeAmount: number;
  adminNote: string;
}

export function VerificationRejected({
  userName,
  prizeAmount,
  adminNote,
}: VerificationRejectedProps) {
  return (
    <table
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      <tbody>
        <tr>
          <td style={{ padding: "40px 32px 20px", textAlign: "center" }}>
            <h1 style={{ color: "#FF6B6B", fontSize: 32, margin: 0 }}>
              causeClub
            </h1>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "0 32px", textAlign: "center" }}>
            <h2 style={{ color: "#1a1a2e", fontSize: 22, margin: "0 0 12px" }}>
              Verification Update
            </h2>
            <p style={{ color: "#555", fontSize: 16, margin: "0 0 8px" }}>
              Hi {userName},
            </p>
            <p style={{ color: "#555", fontSize: 16, margin: "0 0 8px" }}>
              Your &pound;{prizeAmount.toFixed(2)} win verification could not
              be approved.
            </p>
            <p
              style={{
                color: "#1a1a2e",
                fontSize: 14,
                fontStyle: "italic",
                margin: "0 0 8px",
                backgroundColor: "#f9f9f9",
                padding: 12,
                borderRadius: 6,
              }}
            >
              Note from admin: {adminNote}
            </p>
            <p style={{ color: "#555", fontSize: 16, margin: "0 0 24px" }}>
              Please re-upload valid proof.
            </p>
            <a
              href="https://causeclub.app/dashboard"
              style={{
                display: "inline-block",
                backgroundColor: "#FF6B6B",
                color: "#ffffff",
                padding: "14px 32px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Re-upload Proof
            </a>
          </td>
        </tr>
        <tr>
          <td
            style={{
              padding: "32px",
              textAlign: "center",
              borderTop: "1px solid #eee",
            }}
          >
            <p style={{ color: "#999", fontSize: 12, margin: 0 }}>
              &copy; {new Date().getFullYear()} causeClub. All rights reserved.
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default VerificationRejected;
