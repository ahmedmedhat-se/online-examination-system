import { Navigate } from 'react-router-dom';

function GuestGuard({ children }) {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');

    if (storedUser && accessToken) {
        let user;
        try {
            user = JSON.parse(storedUser);
        } catch {
            return children;
        }

        const redirectMap = {
            student: '/dashboard/student',
            instructor: '/dashboard/instructor',
            admin: '/dashboard/admin',
        };
        return <Navigate to={redirectMap[user.role] || '/dashboard/student'} replace />;
    }

    return children;
}

export default GuestGuard;