import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Error = () => {
    return (
        <main className='w-full h-full flex flex-col items-center justify-center font-sans font-medium'>
            <p>OOPS! Page Not Found</p>
            <h1 className='font-extrabold text-9xl'>404</h1>
            <p>We are sorry, but the page you requested was not found</p>
            <Button asChild className="mt-4">
                <Link to="/">Go Home</Link>
            </Button>
        </main>
    );
};

export default Error;
