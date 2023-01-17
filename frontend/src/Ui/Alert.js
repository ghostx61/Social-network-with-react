import './Alert.css';
const Alert = (props) => {
    return (
        <div className="alert alert-danger" role="alert">
            {props.message}
            <div className="progress" role="progressbar" aria-label="Example 1px high" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar progress-bar-animation"></div>
            </div>
        </div>
    );
}

export default Alert;