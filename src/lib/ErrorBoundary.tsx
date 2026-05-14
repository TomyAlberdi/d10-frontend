// Create src/components/ErrorBoundary.tsx
import React, { type ReactNode } from "react";

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught:", error);
    // Don't crash, just log it
    this.setState({ hasError: false });
  }

  render() {
    return this.props.children;
  }
}
