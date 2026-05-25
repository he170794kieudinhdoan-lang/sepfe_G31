import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-gray-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Đã xảy ra lỗi</h1>
          <p className="max-w-md text-gray-500">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Tải lại trang
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-2xl overflow-auto rounded bg-red-50 p-4 text-left text-xs text-red-700">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
