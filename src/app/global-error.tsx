"use client"

import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // The root layout is replaced when this renders, so styles are inline.
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#12100e",
          color: "#f5f1e8",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          padding: "24px",
        }}
      >
        <main
          role="alert"
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid #2c2722",
            background: "#1a1714",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#f28c0f",
            }}
          >
            PizzaHub
          </p>
          <h1
            style={{
              margin: "16px 0 0",
              fontSize: "28px",
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            The app hit a snag
          </h1>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#b9b1a7",
            }}
          >
            Something failed before the page could load. Reload to try again.
            If it keeps happening, come back in a moment.
          </p>

          {error.digest ? (
            <p
              style={{
                margin: "12px 0 0",
                fontSize: "12px",
                color: "#8d857c",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "10px",
                border: "none",
                background: "#f28c0f",
                color: "#0a0a0a",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "40px",
                padding: "0 20px",
                borderRadius: "10px",
                border: "1px solid #3a342d",
                color: "#f5f1e8",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
