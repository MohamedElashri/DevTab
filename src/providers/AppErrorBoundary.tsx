import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AiFillBug } from 'src/components/Elements/Icons'
import { WiRefresh } from 'src/components/Elements/Icons'

type AppErrorBoundaryProps = {
  children: ReactNode
}

type AppErrorBoundaryState = {
  hasError: boolean
  error: unknown
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('DevTab uncaught error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="Page appError">
          <AiFillBug size={64} />
          <p>Sorry there was a problem loading this page.</p>
          <p>{String(this.state.error)}</p>
          <button onClick={this.handleReset}>
            <WiRefresh size={32} className={'buttonIcon'} /> Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
