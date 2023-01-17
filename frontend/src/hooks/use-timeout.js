import { useEffect, useState } from 'react';

const useTimeout = (initialState, delay) => {
    const [isAlert, setIsAlert] = useState(initialState);
    useEffect(() => {
        console.log('effect')
        let timer = setTimeout(() => {
            setIsAlert(null);
        }, delay * 1000);

        return () => {
            clearTimeout(timer);
        }
    }, [isAlert]);
    return [isAlert, setIsAlert];
}

export default useTimeout;