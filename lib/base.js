"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = exports.createBaseActions = exports.requestBese = void 0;
const requestBese = (_actions) => (input, init = {}) => new Promise((resolve, reject) => {
    const { convertType = 'json', ...options } = init;
    fetch(input, options)
        .then(res => res[convertType]())
        .then(resolve)
        .catch(reject);
});
exports.requestBese = requestBese;
const createBaseActions = (_ctx) => ({});
exports.createBaseActions = createBaseActions;
const createClient = ({ initializer, createActions, requestFn = exports.requestBese }) => (userConfig) => {
    const ctx = initializer(userConfig);
    const actions = createActions(ctx);
    return requestFn(actions);
};
exports.createClient = createClient;
