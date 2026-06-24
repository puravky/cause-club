import React from "react";

interface PaymentReceiptProps {
  userName: string;
  amount: number;
  charityName: string;
  prizePoolContribution: number;
  plan: string;
}

export function PaymentReceipt({
  userName,
  amount,
  charityName,
  prizePoolContribution,
  plan,
}: PaymentReceiptProps) {
  const charityAmount = amount - prizePoolContribution;

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
          <td style={{ padding: "0 32px" }}>
            <h2 style={{ color: "#1a1a2e", fontSize: 22, margin: "0 0 8px" }}>
              Payment Receipt
            </h2>
            <p style={{ color: "#555", fontSize: 14, margin: "0 0 24px" }}>
              Thanks, {userName}! Here&rsquo;s your {plan} breakdown:
            </p>

            <table
              style={{ width: "100%", borderCollapse: "collapse" }}
              cellPadding={0}
              cellSpacing={0}
            >
              <tbody>
                <tr>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                    <span style={{ color: "#555", fontSize: 14 }}>Donation to {charityName}</span>
                  </td>
                  <td
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #eee",
                      textAlign: "right",
                      color: "#1a1a2e",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    &pound;{charityAmount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
                    <span style={{ color: "#555", fontSize: 14 }}>Prize pool contribution</span>
                  </td>
                  <td
                    style={{
                      padding: "12px 0",
                      borderBottom: "1px solid #eee",
                      textAlign: "right",
                      color: "#1a1a2e",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    &pound;{prizePoolContribution.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 0" }}>
                    <span style={{ color: "#1a1a2e", fontSize: 16, fontWeight: 700 }}>
                      Total
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 0",
                      textAlign: "right",
                      color: "#1a1a2e",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    &pound;{amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <p
              style={{
                color: "#555",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "24px 0 0",
              }}
            >
              &pound;{charityAmount.toFixed(2)} to {charityName}, &pound;
              {prizePoolContribution.toFixed(2)} to prize pool
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

export default PaymentReceipt;
