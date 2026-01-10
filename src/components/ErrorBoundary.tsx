import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <Alert variant="destructive" className="my-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Algo salió mal</AlertTitle>
                    <AlertDescription>
                        {this.state.error?.message || "Error desconocido al renderizar el componente."}
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
