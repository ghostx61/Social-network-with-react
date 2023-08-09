import { Fragment, useState } from 'react';
import classes from './Modal.module.css';

const Modal = (props) => {
    const [showModal, setShowModal] = useState(true);
    return (
        <Fragment>
            <div className={classes.backdrop}></div>
            <div className={`card ${classes['post-modal']}`}>
                <div className={classes['card-title-container']}>
                    <h3 className={classes['title']}>{props.title || ''}</h3>
                    <button type="button" className={`btn-close ${classes['close-btn']}`} onClick={props.close}></button>
                </div>
                <div className="card-body">
                    {props.children}
                </div>
            </div>
        </Fragment>
    )
}

export default Modal;