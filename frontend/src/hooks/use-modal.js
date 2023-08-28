
import { modalActions } from '../store/modal-slice';
import { useDispatch } from 'react-redux';
const useModal = () => {
    const dispatch = useDispatch();
    function openModal(modalName) {
        // console.log('use modal open');
        dispatch(modalActions.toggleModal({ modalName, setModalValue: true }));
    }
    function closeModal(modalName) {
        // console.log('use modal close');
        dispatch(modalActions.toggleModal({ modalName, setModalValue: false }));
    }

    return { openModal, closeModal };
}
export default useModal;