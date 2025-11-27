// /utils/helpers/arrayUtils.js

/**
 * Удаляет элемент из массива по значению
 */
export const removeItem = (arr, value) => {
    const index = arr.indexOf(value);
    if (index !== -1) arr.splice(index, 1);
    return arr;
};

/**
 * Проверяет, пустой ли массив
 */
export const isEmpty = (arr) => !arr || arr.length === 0;

/**
 * Возвращает копию массива без дубликатов
 */
export const unique = (arr) => Array.from(new Set(arr));


export const sortByKey = (arr, key, asc = true) =>
    [...arr].sort((a, b) => (a[key] > b[key] ? 1 : -1) * (asc ? 1 : -1));
  
  export const filterByKey = (arr, key, value) => arr.filter(item => item[key] === value);
  