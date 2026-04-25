import { Navigate } from 'react-router-dom';

function RoleGuard({ children, allowedRoles }) {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (!storedUser || !accessToken) {
        return <Navigate to="/auth?mode=login" replace />;
    }

    let user;
    try {
        user = JSON.parse(storedUser);
    } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return <Navigate to="/auth?mode=login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        const redirectMap = {
            student: '/dashboard/student',
            instructor: '/dashboard/instructor',
            admin: '/dashboard/admin',
        };
        return <Navigate to={redirectMap[user.role] || '/auth?mode=login'} replace />;
    }

    return children;
}

export default RoleGuard;