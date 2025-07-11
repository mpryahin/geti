// Copyright (C) 2022-2025 Intel Corporation
// LIMITED EDGE SOFTWARE DISTRIBUTION LICENSE

import { CalendarDate, CalendarDateTime, DateValue } from '@internationalized/date';
import { LoadingState, KeyboardEvent as ReactKeyboardEvent } from '@react-types/shared';
import dayjs, { OptionType } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import { filesize, FileSizeOptionsBase } from 'filesize';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import negate from 'lodash/negate';
import * as yup from 'yup';

import { DOMAIN } from '../core/projects/core.interface';
import { Task } from '../core/projects/task.interface';
import { KeyMap } from './keyboard-events/keyboard.interface';
import { LOCAL_STORAGE_KEYS } from './local-storage-keys';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const ONE_MINUTE = 60_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never;

const requiredCharactersPart = '^(?=.*[A-Z])(?=.*[a-z])((?=.*[0-9])|(?=.*[#%!$&()*+,-.:;<=>?@\\[\\]^_{|}~]))';
const allowedCharactersAndLengthPart = '^[A-Za-z0-9#%!$&()*+,-.:;<=>?@\\[\\]^_{|}~]*$';

export const passwordRequiredCharactersRegex = new RegExp(requiredCharactersPart);
export const passwordAllowedCharactersRegex = new RegExp(allowedCharactersAndLengthPart);

export const MISSING_REQUIRED_CHARACTERS_MESSAGE =
    'Password must contains at least one capital letter, lower letter, digit or symbol.';

const NOT_ALLOWED_CHARACTERS_MESSAGE = 'Passwords must contains only latin letters, digits or symbols.';

const TOO_SHORT_MESSAGE = 'Password is too short. It should consist of 8 - 200 characters.';
const TOO_LONG_MESSAGE = 'Password is too long. It should consist of 8 - 200 characters.';

export const NEW_PASSWORD_ERROR_MESSAGE =
    'Password must consist of 8 - 200 characters, at least one capital letter, lower letter, digit or symbol.';

export const CONFIRM_PASSWORD_ERROR_MESSAGE = 'The password you entered did not match.';

export const PASSWORD_DOES_NOT_MEET_LENGTH_RULE =
    'The password you pasted consists of more than a maximum 200 characters.';

export const LONG_FORMAT_DATE = 'DD/MM/YYYY HH:mm';

export const SHORT_FORMAT_DATE = 'DD/MM/YYYY';

export const DATE_TIME_IN_ISO_AND_UTC_OFFSETFORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

/* eslint-disable  @typescript-eslint/no-explicit-any */
const sort = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false, ascending = true): T[] => {
    return [
        ...list.sort((previous: T, current: T): number => {
            let previousValue: any = previous[attribute],
                currentValue: any = current[attribute];
            let comparison: any;
            if (typeof previous[attribute] === 'string' && toLowercase) {
                previousValue = (previous[attribute] as unknown as string).toLowerCase();
                currentValue = (current[attribute] as unknown as string).toLowerCase();
                comparison = previousValue.localeCompare(currentValue);
            } else {
                comparison = previousValue < currentValue ? -1 : 1;
            }
            return ascending ? comparison : comparison <= 0 ? 1 : -1;
        }),
    ];
};

export const sortAscending = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false): T[] => {
    return sort(list, attribute, toLowercase);
};

export const sortDescending = <T, K extends keyof T>(list: T[], attribute: K, toLowercase = false): T[] => {
    return sort(list, attribute, toLowercase, false);
};

export const camelCaseSplitter = (value: string): string => value.replace(/([^A-Z])([A-Z])/g, '$1 $2');

export const encodeToBase64 = (password: string): string => {
    return btoa(password);
};

export const MAX_NUMBER_OF_PASSWORD_CHARACTERS = 200;
export const MIN_NUMBER_OF_PASSWORD_CHARACTERS = 8;

export const passwordValidationRules = (requiredPasswordMessage: string) =>
    yup
        .string()
        .required(requiredPasswordMessage)
        .matches(passwordAllowedCharactersRegex, NOT_ALLOWED_CHARACTERS_MESSAGE)
        .matches(passwordRequiredCharactersRegex, MISSING_REQUIRED_CHARACTERS_MESSAGE)
        .min(MIN_NUMBER_OF_PASSWORD_CHARACTERS, TOO_SHORT_MESSAGE)
        .max(MAX_NUMBER_OF_PASSWORD_CHARACTERS, TOO_LONG_MESSAGE);

export const formatDate = (date: string | number, format: string): string => dayjs(date).format(format);

export const isValidDate = (date: string, formats: OptionType): boolean => dayjs(date, formats, true).isValid();

// When using `compare`, a negative result indicates that this date is before the given one,
// and a positive date indicates that it is after
export const isDateBetween = (
    date: DateValue,
    minDate: CalendarDate | CalendarDateTime,
    maxDate: CalendarDate | CalendarDateTime
): boolean => {
    return date.compare(minDate) >= 0 && date.compare(maxDate) <= 0;
};

export const formatUtcToLocal = (date: string, format: string): string => dayjs.utc(date).local().format(format);

export const formatLocalToUtc = (date: string, localFormat?: string): string =>
    dayjs(date, localFormat).utc(false).local().format();

export const runWhen =
    <T>(predicate: (...args: T[]) => boolean) =>
    (whenTrueFn: (...args: any[]) => void) =>
    (...args: T[]): void => {
        if (predicate(...args)) {
            whenTrueFn(...args);
        }
    };

export const runWhenTruthy = runWhen(negate(isNil));

export const onEscape = runWhen(({ key }: KeyboardEvent | ReactKeyboardEvent) => key === KeyMap.Esc);

export const openNewTab = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const removeLocalStorageKey = (key: LOCAL_STORAGE_KEYS): void => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
    }
};

export const getParsedLocalStorage = <T>(key: string): T | null => {
    if (Boolean(localStorage.getItem(key))) {
        return JSON.parse(localStorage.getItem(key) as string) as T;
    }

    return null;
};

export const setParsedLocalStorage = (key: string, data: unknown): void => {
    localStorage.setItem(key, JSON.stringify(data));
};

export const hasEqualId =
    <T extends { id: string }>(id: string | null | undefined) =>
    (annotationToFind: T) =>
        isEqual(annotationToFind.id, id);

export const hasEqualDomain =
    <T extends { domain: DOMAIN }>(domain: DOMAIN | undefined) =>
    (data: T) =>
        isEqual(data.domain, domain);

export const getId = <T extends { id: string }>(obj: T) => obj.id;
export const getIds = <T extends { id: string }>(objs: ReadonlyArray<T>) => objs.map(getId);

export const isDifferent = negate(isEqual);
export const hasDifferentId = (id?: string) => negate(hasEqualId(id));

export const isNotCropTask = (task: Task) => isNotCropDomain(task.domain);
export const isNotCropDomain = (domain: DOMAIN) => domain !== DOMAIN.CROP;

export const hasEqualSize = <T extends { length: number }, U extends { length: number }>(a: T, b: U) =>
    isEqual(a.length, b.length);

type IsValidArrayType<T> = T extends any[] ? GetElementType<T> : never;
export const isNonEmptyArray = <T>(value: T): value is IsValidArrayType<T> => Array.isArray(value) && !isEmpty(value);

export const isNonEmptyString = (value: unknown): value is string => isString(value) && value !== '';

export const formatDownloadUrl = (url: string) => (url.startsWith('/') ? url : `/${url}`);

export const downloadFile = (url: string, name?: string) => {
    const link = document.createElement('a');

    if (name) {
        link.download = name;
    }

    link.href = url;
    link.hidden = true;
    link.click();

    link.remove();
};

export const formatJobsCreationTime = (date: string): string => formatDate(date, 'HH:mm:ss, DD MMM YY');

export const loadImage = (link: string): Promise<HTMLImageElement> =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'use-credentials';

        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);

        image.fetchPriority = 'high';
        image.src = link;

        if (process.env.NODE_ENV === 'test') {
            // Immediately load the media item's image
            resolve(image);
        }
    });

export const redirectTo = (url: string): void => {
    window.location.href = url;
};

export const getProgressScoreColor = (value: number): string => {
    const LOW_SCORE = 40;
    const HIGH_SCORE = 80;

    return value < LOW_SCORE
        ? 'var(--brand-coral-cobalt)'
        : value < HIGH_SCORE
          ? 'var(--brand-daisy)'
          : 'var(--brand-moss)';
};

export const trimAndLowerCase = (text: string): string => String(text).trim().toLocaleLowerCase();

export const getUniqueNameFromArray = (arrayOfNames: string[], namePrefix: string): string => {
    let nextAvailableIndex = 1;

    for (let index = 0; index < arrayOfNames.length; index++) {
        const nameDoesExist = !!arrayOfNames.find((name) => name === `${namePrefix}${nextAvailableIndex}`);

        // Once we find the first available element we exit the loop and use that index (+1)
        if (!nameDoesExist) {
            break;
        }

        nextAvailableIndex++;
    }

    return `${namePrefix}${nextAvailableIndex}`;
};

export const getFileSize = (fileSize: number | undefined, options?: FileSizeOptionsBase): string => {
    if (fileSize === undefined || Number.isNaN(fileSize)) {
        return '';
    }

    return filesize(fileSize, { standard: 'si', output: 'string', ...options }).toLocaleUpperCase();
};

export const trimText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}...` : text;

export const getDateTimeInISOAndUTCOffsetFormat = (date: dayjs.Dayjs): string => {
    return date.format(DATE_TIME_IN_ISO_AND_UTC_OFFSETFORMAT);
};

export const formatToFileArray = (files: FileList | File[] | null): File[] => {
    return (files && Array.from(files)) ?? [];
};

export const onValidFileList = runWhen((files: FileList | File[] | null) => isNonEmptyArray(formatToFileArray(files)));

export const delay = (time = 0) => new Promise((resolve) => setTimeout(resolve, time));

const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });

const suffixes = new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th'],
]);

export const ordinalSuffixOf = (n: number): string => {
    return suffixes.get(pr.select(n)) || '';
};

type Enumify<T extends string> = {
    [K in T]: K;
};

export const SpectrumTableLoadingState: Enumify<LoadingState> = {
    loading: 'loading',
    sorting: 'sorting',
    loadingMore: 'loadingMore',
    error: 'error',
    idle: 'idle',
    filtering: 'filtering',
};

export const getPlural = (total: number) => (total === 1 ? '' : 's');

export const pluralize = (count: number, singular: string): string => {
    return `${count} ${singular}${getPlural(count)}`;
};

export const sanitize = (str: string) => {
    const pattern = /[^a-zA-Z0-9]/g; // We only allow letters and numbers

    return str.replace(pattern, '_');
};

export enum SortDirection {
    /**
     * Sort items in ascending order.
     * This means arranging from the lowest value to the highest (e.g. a-z, 0-9).
     */
    ASC = 'ASC',

    /**
     * Sort items in descending order.
     * This means arranging from the highest value to the lowest (e.g. z-a, 9-0).
     */
    DESC = 'DESC',
}

/**
 *
 * @param variableName Accepts any spectrum variable name
 * @returns Returns the final value of the variable, e.g. pixels, hash color etc
 */
export const getDimensionValueFinalValue = (variableName: string): string => {
    const themeProvider = document.getElementById('theme-provider');

    if (themeProvider === null) {
        return '';
    }

    const cleanName = variableName.replaceAll('var(', '').replaceAll(')', '').split(',')[0];
    const computedStyle = getComputedStyle(themeProvider);
    return computedStyle.getPropertyValue(cleanName).trim();
};

export const getDownloadNotificationMessage = (exportName: string): string =>
    `Your ${exportName} file is being prepared and will start downloading shortly.`;
