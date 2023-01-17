
const sendRequest = async (options) => {
    const API_URL = 'http://localhost:3100/api';
    let data = null;
    let error = null;
    try {
        const response = await fetch(API_URL + options.url, {
            method: options.method,
            body: JSON.stringify(options.body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
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