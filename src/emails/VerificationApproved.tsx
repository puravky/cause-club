import React from "react";

interface VerificationApprovedProps {
  userName: string;
  prizeAmount: number;
  drawMonth: string;
  drawYear: string;
}

export function VerificationApproved({
  userName,
  prizeAmount,
  drawMonth,
  drawYear,
}: VerificationApprovedProps) {
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
              Win Verified
            </h2>
            <p style={{ color: "#555", fontSize: 16, margin: "0 0 8px" }}>
              Hi {userName},
            </p>
            <p
              style={{
                color: "#1a1a2e",
                fontSize: 18,
                fontWeight: 600,
                margin: "0 0 24px",
              }}
            >
              Your &pound;{prizeAmount.toFixed(2)} win for {drawMonth}{" "}
              {drawYear} is approved. Payout pending.
            </p>
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

export default VerificationApproved;
