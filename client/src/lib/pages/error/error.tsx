import React from 'react';

const Error: React.FC = () => {
    return (
        <main className='w-full h-full flex flex-col items-center justify-center uppercase font-sans font-medium'>
            <p >OOPS! Page Not Found</p>
            <h1 className='font-extrabold text-9xl'>404</h1>
            <p>We are sorry, but the page you requested was not found</p>
        </main>
    );
};

export default Error;