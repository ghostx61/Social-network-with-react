import { Fragment, useState, useRef } from "react";
import classes from './HomePage.module.css';
import useInput from '../../hooks/use-input';
import Post from "../../Ui/Post";


const HomePage = () => {
    const [activeTab, setActiveTab] = useState('post');
    const postInputRef = useRef();
    const [
        postInputValue,
        setPostInputValue,
        postInputChangeHanlder
    ] = useInput()
    const togglePostClass = activeTab === 'post' ? classes['active'] : '';
    const togglePhotoClass = activeTab === 'photo' ? classes['active'] : '';
    const photoIcon = `${process.env.PUBLIC_URL}/image-icon.png`
    const togglePostHanlder = (postType) => {
        console.log(postType);
        if (postType === 'post') {
            setActiveTab('post');
        } else {
            setActiveTab('photo');
        }
    }
    const popupOpenHandler = (event) => {

    }
    const postSubmitHandler = (event) => {
        event.preventDefault();
        const enteredPostInputValue = postInputValue;
        if (enteredPostInputValue) {
            console.log(enteredPostInputValue);
        }
    }
    const postForm = (
        <form onSubmit={postSubmitHandler}>
            <div className="mb-3">
                <textarea className="form-control" id="exampleFormControlTextarea1" rows="3" placeholder="What's on your mind?" ref={postInputRef} value={postInputValue} onChange={postInputChangeHanlder}></textarea>
            </div>
            <div className="d-grid gap-2">
                <button className="btn btn-primary" disabled={postInputValue.length <= 0}>Post</button>
            </div>
        </form>
    );
    return (
        <Fragment>
            <h3>Home</h3>
            <div className="card" style={{ marginBottom: '15px' }}>
                {/* <div className="card-body">
                    <div className={classes.tabs}>
                        <div className={`${classes['post-tab']} ${classes['text-tab']} ${togglePostClass}`} onClick={togglePostHanlder.bind(this, 'post')}>Post</div>
                        <div className={`${classes['post-tab']} ${classes['photo-tab']} ${togglePhotoClass}`} onClick={togglePostHanlder.bind(this, 'photo')}>Photo</div>
                    </div>
                    <div className={classes.content}>

                        {activeTab === 'post' && postForm}
                        {activeTab === 'photo' && <h4>Photo</h4>}
                    </div>
                </div> */}
                <div className="card-body">
                    <textarea rows="1" className={`form-control ${classes['newUploadBtn']}`} placeholder="Write Something..." onClick={popupOpenHandler}></textarea>
                    {/* <div className={`${classes.popupBtnContainer}`}>
                        <div className={`${classes.popupBtn} ${classes.postPopupBtn}`}><img src={photoIcon} alt="Photo" /> Write Something</div>
                        <div className={`${classes.popupBtn} ${classes.photoPopupBtn}`}><img src={photoIcon} alt="Photo" /> Upload Photo</div>
                    </div> */}
                </div>
            </div>
            <Post />
        </Fragment>
    );
}

export default HomePage;