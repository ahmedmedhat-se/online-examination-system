import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './app/layout/MainLayout.jsx';

function LoadingFallback() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: '#94a3b8',
            fontSize: '15px',
            gap: '10px',
            fontWeight: 500
        }}>
            <i className="fas fa-spinner fa-spin" style={{ color: '#f59e0b', fontSize: '22px' }}></i>
            Loading...
        </div>
    );
}

function LazyElement({ children }) {
    return (
        <Suspense fallback={<LoadingFallback />}>
            {children}
        </Suspense>
    );
}

const Auth = lazy(() => import('./app/components/auth/Auth.jsx'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            { path: 'auth', element: <LazyElement><Auth /></LazyElement> }
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;