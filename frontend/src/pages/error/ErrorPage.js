const TopModal = require("../../Ui/TopModal/TopModal")

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
            <svg
                aria-label="Home"
                fill="#262626"
                height="22"
                viewBox="0 0 48 48"
                width="22"
            >
                <path
                    clip-rule="evenodd"
                    d="M44.36 21.35l-18-15a1 1 0 00-1.39 0l-18 15a1 1 0 00-.37.78V42a1 1 0 001 1h10a1 1 0 001-1v-9h6v9a1 1 0 001 1h10a1 1 0 001-1V22.13a1 1 0 00-.37-.78zM24 4.76L42 20.9V40a1 1 0 01-1 1H33a1 1 0 01-1-1v-9a1 1 0 00-1-1h-6a1 1 0 00-1 1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V20.9L24 4.76zm-2 29.24V25a1 1 0 011-1h4a1 1 0 011 1v9.95a1 1 0 01-1.46.92L24 34.75l-2.54 1.87A1 1 0 0120 35zM6 41V23.59L24 6l18 17.59V41H6z"
                    fill-rule="evenodd"
                ></path>
            </svg>

            {/* <TopModal
                title='Delete Post'
                bodyCopy="Are you sure you want to delete this post?"
                buttonClickHandler={newHandler}
                closeModal={closeBtn}
                buttonLoading={false}
            /> */}
        </div>
    )
}

export default ErrorPage;