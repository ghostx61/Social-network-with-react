import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import classes from './PageMessage.module.css';

const PageMessage = (props) => {
    const marginTop = props.mt || 15;
    const newImage = props.showImg || '';
    const clickFunction = props.onClickFtn;
    const plusLogo = (<svg viewBox="0 0 512 512">
        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
    </svg>);
    const plusLogo2 = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM200 344V280H136c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H248v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" /></svg>
    const plusLogo3 = <img src='/circle-plus.png' />;
    const plusLogo4 = <img src='/user-circle.png' />;
    return (
        <div className={classes['message-container']} style={{ marginTop: `${marginTop}px` }}>
            {newImage === 'plus' && plusLogo3}
            {newImage === 'user' && plusLogo4}
            {props.title && <h2>{props.title}</h2>}
            {props.body && <p>{props.body}</p>}
            {props.url && <Link type="button" className="btn btn-link" to={props.url}>{props.btnText}</Link>}
            {clickFunction && <button type="button" className="btn btn-link" onClick={clickFunction}>{props.btnText}</button>}
        </div >
    )
}

export default PageMessage;