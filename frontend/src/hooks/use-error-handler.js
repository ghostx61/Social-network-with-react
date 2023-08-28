import useAuth from './use-Auth';
import { useHistory } from 'react-router-dom';

const useErrorHandler = () => {
    const auth = useAuth();
    const history = useHistory();
    function handleError(err) {
        console.log(err);
        if (err === 'Authorization failed') {
            auth.userLogout();
            return;
        }
        history.replace('/error');
    }
    return handleError;
}

export default useErrorHandler;

