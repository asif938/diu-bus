import React from 'react';
import { Link } from 'react-router';

const Home = () => {
    return (
        <div>
            <Link to="/send-location/surjomukhi-12" className="text-4xl text-center">SendLocation (surjomukhi-12)</Link> <br />
            <Link to="/send-location/surjomukhi-16" className="text-4xl text-center">SendLocation (surjomukhi-16)</Link>
        </div>
    );
};

export default Home;