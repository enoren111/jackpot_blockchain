import React from 'react';
import Navbar from './navbar';
import BlackBoard from './blackboard';
import CurrInfo from './currinfo';

const Home = () => {
    return (
        <div className="container">
            <div className = "row-12 mb-3">
                <Navbar />
            </div>
            <div className = "row mb-3">
                    <BlackBoard />
            </div>
            <div className = "row mb-3">
                    <CurrInfo />
            </div>
        </div>
        
    );
}

export default Home