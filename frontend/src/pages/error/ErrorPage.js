const { default: TopModal } = require("../../Ui/TopModal/TopModal")

const ErrorPage = () => {
    const newHandler = () => {
        console.log('new handel');
    }
    const closeBtn = () => {
        console.log('close');
    }
    return (
        <div>
            <h1>Error Page</h1>
            <TopModal
                title='Delete Post'
                bodyCopy="Are you sure you want to delete this post?"
                buttonClickHandler={newHandler}
                closeModal={closeBtn}
                buttonLoading={false}
            />
        </div>
    )
}

export default ErrorPage;