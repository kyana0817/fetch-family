export const requestBese = (_actions) => (input, init = {}) => new Promise((resolve, reject) => {
    const { convertType = 'json', ...options } = init;
    fetch(input, options)
        .then(res => res[convertType]())
        .then(resolve)
        .catch(reject);
});
export const createBaseActions = (_ctx) => ({});
export const createClient = ({ initializer, createActions, requestFn = requestBese }) => (userConfig) => {
    const ctx = initializer(userConfig);
    const actions = createActions(ctx);
    return requestFn(actions);
};
