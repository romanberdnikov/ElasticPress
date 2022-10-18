/**
 * Internal deendencies.
 */
import { sanitizeArg, sanitizeParam } from './utilities';

/**
 * Format a date.
 *
 * @param {string} date Date string.
 * @param {string} locale BCP 47 language tag.
 * @returns {string} Formatted number.
 */
export const formatDate = (date, locale) => {
	return new Date(date).toLocaleString(locale, { dateStyle: 'long' });
};

/**
 * Format a number as a price.
 *
 * @param {number} number  Number to format.
 * @param {object} options Formatter options.
 * @returns {string} Formatted number.
 */
export const formatPrice = (number, options) => {
	const format = new Intl.NumberFormat(navigator.language, {
		style: 'currency',
		currencyDisplay: 'narrowSymbol',
		...options,
	});

	return format.format(number);
};

/**
 * Get the post types from a search form.
 *
 * @param {HTMLFormElement} form Form element.
 * @returns {Array} Post types.
 */
export const getPostTypesFromForm = (form) => {
	const data = new FormData(form);

	if (data.has('post_type')) {
		return data.getAll('post_type').slice(-1);
	}

	if (data.has('post_type[]')) {
		return data.getAll('post_type[]');
	}

	return [];
};

/**
 * Get permalink URL parameters from args.
 *
 * @typedef {object} ArgSchema
 * @property {string}    type            Arg type.
 * @property {any}       [default]       Default arg value.
 * @property {Array}     [allowedValues] Array of allowed values.
 *
 * @param    {object}    args            Args
 * @param    {ArgSchema} schema          Args schema.
 * @param    {string}    [prefix]        Prefix to prepend to args.
 * @returns {URLSearchParams} URLSearchParams instance.
 */
export const getUrlParamsFromArgs = (args, schema, prefix = '') => {
	const urlParams = new URLSearchParams();

	Object.entries(schema).forEach(([arg, options]) => {
		const param = prefix + arg;
		const value = typeof args[arg] !== 'undefined' ? sanitizeParam(args[arg], options) : null;

		if (value !== null) {
			urlParams.set(param, value);
		}
	});

	return urlParams;
};

/**
 * Build request args from URL parameters using a given schema.
 *
 * @typedef {object} ArgSchema
 * @property {string}                     type            Arg type.
 * @property {any}                        [default]       Default arg value.
 * @property {Array}                      [allowedValues] Array of allowed values.
 *
 * @param    {URLSearchParams}            urlParams       URL parameters.
 * @param    {object.<string, ArgSchema>} schema          Schema to build args from.
 * @param    {string}                     [prefix]        Parameter prefix.
 * @param    {boolean}                    [useDefaults]   Whether to populate params with default values.
 * @returns {object.<string, any>} Query args.
 */
export const getArgsFromUrlParams = (urlParams, schema, prefix = '', useDefaults = true) => {
	const args = Object.entries(schema).reduce((args, [arg, options]) => {
		const param = urlParams.get(prefix + arg);
		const value =
			typeof param !== 'undefined' ? sanitizeArg(param, options, useDefaults) : null;

		if (value !== null) {
			args[arg] = value;
		}

		return args;
	}, {});

	return args;
};

/**
 * Get the current URL, including parameters, with any prefixed parameters
 * replaced with the given parameters.
 *
 * @param {string} paramPrefix Prefix of parameters to replace.
 * @param {object} params Parameters to add, if any.
 * @returns {string} URL.
 */
export const getUrlWithParams = (paramPrefix, params) => {
	const url = new URL(window.location.href);
	const keys = Array.from(url.searchParams.keys());

	for (const key of keys) {
		if (key.startsWith(paramPrefix)) {
			url.searchParams.delete(key);
		}
	}

	if (params) {
		params.forEach((value, key) => {
			url.searchParams.set(key, value);
		});
	}

	return url.toString();
};
