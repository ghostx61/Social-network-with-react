
const sendRequest = async (options) => {
    const API_URL = 'http://localhost:3100/api';
    let data = null;
    let error = null;
    let fetchOptions = {
        method: options.method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (options.hasOwnProperty('body')) {
        if (options.noJson) {
            fetchOptions.body = options.body;
        } else {
            fetchOptions.body = JSON.stringify(options.body);
        }
    }
    if (options.hasOwnProperty('headers')) {
        fetchOptions.headers = options.headers;
    }
    if (options.hasOwnProperty('noHeaders')) {
        delete fetchOptions.headers;
    }
    try {
        console.log(fetchOptions)
        const response = await fetch(API_URL + options.url, fetchOptions);
        data = await response.json();
        if (!response.ok) {
            error = data.errors[0].msg;
            return [null, error];
        }
        return [data, error];
    } catch (err) {
        console.log(err);
        error = err.message;
        return [null, error];
    }
}
export default sendRequest;