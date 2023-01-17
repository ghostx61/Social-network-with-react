import { forwardRef } from 'react';

const Input = forwardRef((props, ref) => {
    const inputClass = `form-control ${!props.isValid ? 'is-invalid' : ''}`;
    const otherInputs = {};
    if (props.focus) {
        otherInputs.onFocus = props.focus;
    }
    return (
        <div className="mb-3">
            <label htmlFor={props.id} className="form-label">{props.title}</label>
            <input type={props.type} className={inputClass} id={props.id} placeholder={props.placeholder} ref={ref} {...otherInputs} />
            <div id="UsernameFeedback" className="invalid-feedback">
                {props.invalidMessage}
            </div>
        </div>
    )
})

export default Input;