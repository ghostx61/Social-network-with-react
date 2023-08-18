import { Fragment } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import classes from './TopModal.module.css';

const TopModal = (props) => {
    const isBtnLoading = props.buttonLoading;
    const closeModalHandler = () => {
        console.log('btn click')
        if (!isBtnLoading) {
            props.closeModal();
        }
    }
    return (
        <Fragment>
            <div className={classes['backdrop']} onClick={closeModalHandler}></div>
            <div className={`modal ${classes['modal-container']}`}>
                <div className="modal-dialog">
                    <div className={`modal-content ${classes['modal-content']}`}>
                        <div className="modal-header">
                            <h5 className="modal-title">{props.title}</h5>
                            <button type="button" className="btn-close" aria-label="Close" onClick={closeModalHandler}></button>
                        </div>
                        <div className="modal-body">
                            <p>{props.bodyCopy}</p>
                        </div>
                        <div className="modal-footer">
                            {isBtnLoading && <LoadingSpinner />}
                            {!isBtnLoading && <button type="button" className="btn btn-danger" onClick={props.buttonClickHandler}>Delete</button>}
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default TopModal;