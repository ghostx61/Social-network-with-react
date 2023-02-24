import { forwardRef } from "react"

const TextArea = forwardRef((props, ref) => {
    const inputClass = `form-control ${!props.isValid ? 'is-invalid' : ''}`;
    const otherInputs = {};
    if (props.focus) {
        otherInputs.onFocus = props.focus;
    }
    return (
        <div className="mb-3">
            <label htmlFor={props.id} className="form-label">{props.title}</label>
            <textarea className={inputClass} id={props.id} rows={props.rows || 3} ref={ref} placeholder={props.placeholder} maxLength="150" value={props.value || ''} onChange={props.change || (() => { })} {...otherInputs}></textarea>
            <div id="UsernameFeedback" className="invalid-feedback">
                {props.invalidMessage}
            </div>
        </div>
    )
})
export default TextArea