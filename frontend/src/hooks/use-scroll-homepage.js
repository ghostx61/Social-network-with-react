import { useDispatch } from 'react-redux';
import { homepageScrollActions } from '../store/homepage-scroll-slice';
const useScrollHomepage = () => {
    const dispatch = useDispatch();
    function setScrollY(scrollY) {
        dispatch(homepageScrollActions.setScrollPosY(scrollY));
    }

    return setScrollY;
}
export default useScrollHomepage;