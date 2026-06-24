import React from "react";

interface DrawResultProps {
  userName: string;
  drawMonth: string;
  drawYear: string;
  matchType?: number;
  prizeAmount?: number;
  won: boolean;
}

export function DrawResult({
  userName,
  drawMonth,
  drawYear,
  matchType,
  prizeAmount,
  won,
}: DrawResultProps) {
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
            <h2 style={{ color: "#1a1a2e", fontSize: 22, margin: "0 0 8px" }}>
              {won ? "Congratulations!" : "Draw Results"}
            </h2>
            <p style={{ color: "#555", fontSize: 16, margin: "0 0 24px" }}>
              Draw results are in for {drawMonth} {drawYear}
            </p>

            {won ? (
              <>
                <p style={{ color: "#1a1a2e", fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
                  You matched {matchType} numbers!
                </p>
                <p style={{ color: "#555", fontSize: 16, margin: "0 0 24px" }}>
                  Upload proof to claim &pound;{prizeAmount!.toFixed(2)}
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
                  Upload Proof
                </a>
              </>
            ) : (
              <p style={{ color: "#555", fontSize: 16, margin: 0 }}>
                Better luck next time, {userName}!
              </p>
            )}
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

export default DrawResult;
