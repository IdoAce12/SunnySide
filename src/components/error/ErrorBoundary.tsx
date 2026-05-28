"use client";

import * as React from "react";
import { ErrorState } from "@/components/ui/ErrorState";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "An unexpected error occurred." };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.fallbackTitle ?? "Something went wrong"}
          message={this.state.message}
          onRetry={() => this.setState({ hasError: false, message: "" })}
        />
      );
    }
    return this.props.children;
  }
}
