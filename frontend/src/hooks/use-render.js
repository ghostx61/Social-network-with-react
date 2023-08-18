import { useDispatch } from 'react-redux';
import { renderActions } from '../store/render-component-slice';
const useRender = () => {
    const dispatch = useDispatch();
    function renderComponent(page) {
        if (page === 'profilePage') {
            dispatch(renderActions.renderProfilePage());
        }
    }

    return renderComponent;
}
export default useRender;