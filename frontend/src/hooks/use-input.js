import { useState } from 'react';

const useInput = () => {
    const [textInput, setTextInput] = useState('');
    const [isTextValid, setIsTextVaild] = useState(true);
    const textInputChangeHandler = (event) => {
        setTextInput(event.target.value);
    }
    const textFocusHandler = () => {
        setIsTextVaild(true);
    }
    const checkTextValid = (query) => {
        if (query) {
            return true;
        }
        setIsTextVaild(false);
        return false;
    }
    return [
        textInput,
        setTextInput,
        textInputChangeHandler,
        isTextValid,
        setIsTextVaild,
        checkTextValid,
        textFocusHandler
    ]
}

export default useInput;