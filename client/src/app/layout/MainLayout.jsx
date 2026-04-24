import { Outlet } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import styles from '../styles/MainLayout.module.css';

const MainLayout = () => {
    return (
        <div className={styles.layout}>
            <Header />
            <Navbar />
            <main className={styles.mainContent}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;