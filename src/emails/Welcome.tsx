import React from "react";

interface WelcomeProps {
  userName: string;
}

export function Welcome({ userName }: WelcomeProps) {
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
          <td style={{ padding: "0 32px 24px", textAlign: "center" }}>
            <h2 style={{ color: "#1a1a2e", fontSize: 24, margin: "0 0 12px" }}>
              Welcome to causeClub, {userName}!
            </h2>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.6, margin: "0 0 24px" }}>
              Pick your charity + add your first score
            </p>
            <a
              href="https://causeclub.app/onboarding"
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
              Get Started
            </a>
          </td>
        </tr>
        <tr>
          <td style={{ padding: "32px", textAlign: "center", borderTop: "1px solid #eee" }}>
            <p style={{ color: "#999", fontSize: 12, margin: 0 }}>
              &copy; {new Date().getFullYear()} causeClub. All rights reserved.
            </p>
            <p style={{ color: "#999", fontSize: 12, margin: "4px 0 0" }}>
              <a href="#" style={{ color: "#999", textDecoration: "underline", marginRight: 12 }}>Twitter</a>
              <a href="#" style={{ color: "#999", textDecoration: "underline", marginRight: 12 }}>Instagram</a>
              <a href="#" style={{ color: "#999", textDecoration: "underline" }}>Discord</a>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default Welcome;
