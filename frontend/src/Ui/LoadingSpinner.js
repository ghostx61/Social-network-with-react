
const LoadingSpinner = (props) => {
    const spinnerClass = props.className ? "spinner-border text-primary " + props.className : "spinner-border text-primary";
    return (
        <div className={spinnerClass} role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    )
}

export default LoadingSpinner;