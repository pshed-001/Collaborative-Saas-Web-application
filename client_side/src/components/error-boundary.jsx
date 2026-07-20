import { Component } from 'react'
import Button from './ui/button'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '16px',
          padding: '16px',
        }}>
          <div style={{ fontSize: '48px' }}>&#x1F635;</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      )
    }
    return this.props.children
  }
}
