import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import MainLayout from './app/layout/MainLayout.jsx';
import RoleGuard from './app/guards/RoleGuard.jsx';
import GuestGuard from './app/guards/GuestGuard.jsx';

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
const GuestDashboard = lazy(() => import('./app/interfaces/GuestDashboard.jsx'));
const StudentDashboard = lazy(() => import('./app/interfaces/StudentDashboard.jsx'));
const InstructorDashboard = lazy(() => import('./app/interfaces/InstructorDashboard.jsx'));
const AdminDashboard = lazy(() => import('./app/interfaces/AdminDashboard.jsx'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: (
                    <LazyElement>
                        <GuestGuard>
                            <GuestDashboard />
                        </GuestGuard>
                    </LazyElement>
                ),
            },
            {
                path: 'auth',
                element: (
                    <LazyElement>
                        <GuestGuard>
                            <Auth />
                        </GuestGuard>
                    </LazyElement>
                ),
            },
            {
                path: 'dashboard/student',
                element: (
                    <LazyElement>
                        <RoleGuard allowedRoles={['student']}>
                            <StudentDashboard />
                        </RoleGuard>
                    </LazyElement>
                ),
            },
            {
                path: 'dashboard/instructor',
                element: (
                    <LazyElement>
                        <RoleGuard allowedRoles={['instructor']}>
                            <InstructorDashboard />
                        </RoleGuard>
                    </LazyElement>
                ),
            },
            {
                path: 'dashboard/admin',
                element: (
                    <LazyElement>
                        <RoleGuard allowedRoles={['admin']}>
                            <AdminDashboard />
                        </RoleGuard>
                    </LazyElement>
                ),
            },
        ],
    },
]);

function App() {
    return <RouterProvider router={router} />;
}

export default App;