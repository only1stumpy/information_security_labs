/**
 * API маршрут для шифрования и расшифрования текста
 * Поддерживает различные криптографические алгоритмы
 */

import { alpha } from "motion";
import { NextResponse } from "next/server";

/**
 * Главная функция маршрутизации шифрования
 * @param method - Название метода шифрования (permutation, caesar, visiner, lozung, RSA, SHA-256)
 * @param text - Текст для шифрования/расшифрования
 * @param operation - Операция шифрования или расшифрования (для Caesar)
 * @param rsaP - Пользовательский параметр p для RSA (опционально)
 * @param rsaQ - Пользовательский параметр q для RSA (опционально)
 * @returns Строка с результатом шифрования/расшифрования
 */
function Encrypt(
  method: string,
  text: string,
  operation?: "encrypt" | "decrypt",
  rsaP?: number,
  rsaQ?: number
): string {
  switch (method) {
    case "permutation":
      const [permutationEncrypted, permutationDecrypted] = permutation(text);
      return `Encrypted: ${permutationEncrypted}
Decrypted: ${permutationDecrypted}`;
    case "caesar":
      if (operation === "encrypt") {
        // Показать все возможные варианты шифрования
        const encrypts: string[] = [];
        for (let i = 1; i < 33; i++) {
          encrypts[i - 1] =
            "Сдвиг на " + i + ":\n" + caesar(text, i, "encrypt") + "\n\n";
        }
        return `Исходный текст:
${text}

Все возможные варианты шифрования:

${encrypts.join("")}`;
      } else if (operation === "decrypt") {
        // Показать все возможные сдвиги для подбора ключа
        const decrypts: string[] = [];
        for (let i = 1; i < 33; i++) {
          decrypts[i - 1] =
            "Сдвиг на " + i + ":\n" + caesar(text, i, "decrypt") + "\n\n";
        }
        return `Зашифрованный текст:
${text}

Все возможные варианты расшифровки:

${decrypts.join("")}`;
      } else {
        // Показать все возможные сдвиги (старое поведение для других методов)
        const decrypts: string[] = [];
        for (let i = 1; i < 33; i++) {
          decrypts[i - 1] =
            "Сдвиг на " + i + ":\n" + caesar(text, i, "decrypt") + "\n\n";
        }
        return decrypts.join("");
      }
    case "visiner":
      const visinerKey = "решение";
      const [visinerEncrypted, visinerDecrypted] = visiner(
        text,
        visinerKey.toUpperCase()
      );
      return `Key: ${visinerKey}

Encrypted:
${visinerEncrypted}

Decrypted:
${visinerDecrypted}`;
    case "lozung":
      const lozungKey = "Степанов";
      const [lozungAlphabet, lozungEncrypted, lozungDecrypted] = lozung(
        text,
        lozungKey.toUpperCase()
      );
      return `Key: ${lozungKey}
Alphabet:
${lozungAlphabet}

Encrypted:
${lozungEncrypted}

Decrypted:
${lozungDecrypted}`;
    case "RSA":
      const keys = generateRSAKeys(rsaP, rsaQ);
      if (keys.error) {
        return keys.error;
      }
      const key = "бебе";
      return `Параметр p: ${keys.p}${rsaP ? " (пользовательский)" : " (сгенерированный)"}
Параметр q: ${keys.q}${rsaQ ? " (пользовательский)" : " (сгенерированный)"}
${RSA(text, key.toUpperCase(), keys.e, keys.n, keys.phi)}`;
    default:
      method = "unknown";
      text = "Ошибка: неизвестный метод шифрования";
  }
  return text;
}

/**
 * Шифр простой перестановки
 * Использует ключ [3, 5, 1, 4, 2] для перестановки символов в блоках
 * @param text - Исходный текст для шифрования
 * @returns Кортеж [зашифрованный текст, расшифрованный текст]
 */
function permutation(text: string): [string, string] {
  console.log("initial text: " + text);
  // Ключ перестановки - порядок переставления символов в блоке
  const key: number[] = [3, 5, 1, 4, 2];
  const blockSize = key.length;
  const blocks: string[] = [];

  // Дополняем текст символами "_" до кратности размеру блока
  const paddedText =
    text + "_".repeat((blockSize - (text.length % blockSize)) % blockSize);
  console.log("padded text: " + paddedText);

  // Шифрование: переставляем символы в каждом блоке согласно ключу
  for (let i = 0; i < paddedText.length; i += blockSize) {
    const block = paddedText.slice(i, i + blockSize);
    const encryptedBlock = key.map((k) => block[k - 1]).join("");
    blocks.push(encryptedBlock);
  }
  const encrypted = blocks.join("");

  // Создаем обратный ключ для расшифрования
  const inverseKey: number[] = [];
  key.forEach((k, i) => (inverseKey[k - 1] = i + 1));

  // Расшифрование: применяем обратный ключ
  const decryptedBlocks: string[] = [];
  for (let i = 0; i < encrypted.length; i += blockSize) {
    const block = encrypted.slice(i, i + blockSize);
    const decryptedBlock = inverseKey.map((k) => block[k - 1]).join("");
    decryptedBlocks.push(decryptedBlock);
  }
  const decrypted = decryptedBlocks.join("").trimEnd();

  return [encrypted, decrypted];
}
/**
 * Шифр Цезаря (сдвиговый шифр)
 * Сдвигает каждую букву в алфавите на заданное количество позиций
 * @param text - Текст для обработки
 * @param shift - Величина сдвига (1-32 для русского алфавита)
 * @param operation - Операция: "encrypt" (сдвиг вперед) или "decrypt" (сдвиг назад)
 * @returns Обработанный текст
 */
function caesar(
  text: string,
  shift: number,
  operation: "encrypt" | "decrypt"
): string {
  const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
  // При шифровании сдвигаем вперед, при расшифровании - назад
  const effectiveShift = operation === "encrypt" ? shift : -shift;

  return text
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      // Пропускаем символы, не входящие в алфавит
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      // Циклический сдвиг с учетом границ алфавита
      const newIndex =
        (index + effectiveShift + alphabet.length) % alphabet.length;
      const result = alphabet[newIndex];
      // Сохраняем регистр исходного символа
      return isLower ? result.toLowerCase() : result;
    })
    .join("");
}
/**
 * Шифр Вижинера (полиалфавитный подстановочный шифр)
 * Использует ключевое слово для шифрования, повторяя его по длине текста
 * @param text - Текст для шифрования
 * @param key - Ключевое слово (например, "РЕШЕНИЕ")
 * @returns Кортеж [зашифрованный текст, расшифрованный текст]
 */
function visiner(text: string, key: string): [string, string] {
  // Алфавит без Ё, Ъ, и с пробелом
  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ ";

  // Шифрование: каждая буква сдвигается на позицию соответствующей буквы ключа
  const encrypted = text
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      // Циклическое повторение ключа
      const keyIndex = alphabet.indexOf(key[i % key.length]);
      const newIndex = (index + keyIndex) % alphabet.length;
      const encrypted = alphabet[newIndex];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

  // Расшифрование: вычитаем позицию буквы ключа
  const decrypted = encrypted
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      const keyIndex = alphabet.indexOf(key[i % key.length]);
      const newIndex = (index - keyIndex + alphabet.length) % alphabet.length;
      const encrypted = alphabet[newIndex];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

  return [encrypted, decrypted];
}
/**
 * Лозунговый шифр (шифр подстановки с ключевым словом)
 * Создает сдвинутый алфавит, начинающийся с ключевого слова
 * @param text - Текст для шифрования
 * @param key - Ключевое слово (например, "СТЕПАНОВ")
 * @returns Кортеж [сдвинутый алфавит, зашифрованный текст, расшифрованный текст]
 */
function lozung(text: string, key: string): [string, string, string] {
  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ";
  // Создаем сдвинутый алфавит: ключевое слово + оставшиеся буквы алфавита
  const shAlphabet = key + alphabet.slice(key.length - 1, alphabet.length);

  // Шифрование: заменяем каждую букву на соответствующую из сдвинутого алфавита
  const encrypt = text
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      const encrypted = shAlphabet[index];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

  // Расшифрование: обратная замена
  const decrypt = encrypt
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = shAlphabet.indexOf(upper);
      const encrypted = alphabet[index];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

  return [shAlphabet, encrypt, decrypt];
}
/**
 * Проверка числа на простоту
 * @param num - Число для проверки
 * @returns true если число простое, false иначе
 */
function isPrime(num: number): boolean {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;

  // Проверяем делимость только на нечетные числа до sqrt(num)
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

/**
 * Генерация ключей для RSA
 * @param customP - Пользовательское значение p (опционально)
 * @param customQ - Пользовательское значение q (опционально)
 * @returns Объект с параметрами RSA (p, q, e, n, phi) или ошибкой
 */
function generateRSAKeys(
  customP?: number,
  customQ?: number
): {
  p: number;
  q: number;
  e: number;
  n: number;
  phi: number;
  error?: string;
} {
  /**
   * Наибольший общий делитель (алгоритм Евклида)
   */
  function gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }

  /**
   * Генерация случайного простого числа в заданном диапазоне
   */
  function generatePrime(min: number = 100, max: number = 1000): number {
    let prime: number;
    do {
      prime = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (!isPrime(prime));
    return prime;
  }

  let p: number, q: number;

  // Проверяем валидность пользовательских значений
  if (customP !== undefined && !isPrime(customP)) {
    return {
      p: 0,
      q: 0,
      e: 0,
      n: 0,
      phi: 0,
      error: `Ошибка: Параметр p = ${customP} не является простым числом. Пожалуйста, введите простое число.`,
    };
  }

  if (customQ !== undefined && !isPrime(customQ)) {
    return {
      p: 0,
      q: 0,
      e: 0,
      n: 0,
      phi: 0,
      error: `Ошибка: Параметр q = ${customQ} не является простым числом. Пожалуйста, введите простое число.`,
    };
  }

  // Проверяем, что p и q не равны
  if (customP !== undefined && customQ !== undefined && customP === customQ) {
    return {
      p: 0,
      q: 0,
      e: 0,
      n: 0,
      phi: 0,
      error: `Ошибка: Параметры p и q должны быть разными простыми числами. p = q = ${customP}`,
    };
  }

  // Используем пользовательские значения или генерируем
  if (customP !== undefined && customQ !== undefined) {
    p = customP;
    q = customQ;
  } else if (customP !== undefined) {
    p = customP;
    do {
      q = generatePrime();
    } while (p === q);
  } else if (customQ !== undefined) {
    q = customQ;
    do {
      p = generatePrime();
    } while (p === q);
  } else {
    do {
      p = generatePrime();
      q = generatePrime();
    } while (p === q);
  }

  // n = p * q - модуль RSA
  const n = p * q;
  // φ(n) = (p-1)(q-1) - функция Эйлера
  const phi = (p - 1) * (q - 1);

  /**
   * Поиск открытой экспоненты e
   * e должно быть взаимно простым с φ(n)
   */
  function findE(phi: number): number {
    // Стандартные значения e для RSA
    const possibleE = [3, 5, 17, 257, 65537];

    for (const e of possibleE) {
      if (e < phi && gcd(e, phi) === 1) {
        return e;
      }
    }
    // Если стандартные значения не подходят, генерируем случайное
    let e: number;
    do {
      e = Math.floor(Math.random() * (phi - 2)) + 2;
    } while (gcd(e, phi) !== 1);

    return e;
  }

  const e = findE(phi);

  return { p, q, e, n, phi };
}

/**
 * Шифрование RSA в комбинации с шифром Вижинера
 * Шифрует текст шифром Вижинера, а ключ Вижинера защищает с помощью RSA
 * @param text - Исходный текст
 * @param key - Ключ для шифра Вижинера (например, "БЕБЕ")
 * @param e - Открытая экспонента RSA
 * @param n - Модуль RSA
 * @param phi - Функция Эйлера от n
 * @returns Строка с результатами шифрования и расшифрования
 */
function RSA(
  text: string,
  key: string,
  e: number,
  n: number,
  phi: number
): string {
  /**
   * Поиск мультипликативного обратного элемента (для нахождения закрытого ключа d)
   * d * e ≡ 1 (mod φ(n))
   */
  function modInverse(a: number, m: number): number {
    for (let d = 1; d < m; d++) {
      if ((a * d) % m === 1) {
        return d;
      }
    }
    throw new Error("Обратный элемент не существует");
  }

  /**
   * Модульное возведение в степень (быстрое возведение в степень)
   * Вычисляет (base^exponent) mod modulus эффективно
   */
  function modPow(base: number, exponent: number, modulus: number): number {
    let result = 1;
    base = base % modulus;

    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
      }
      exponent = Math.floor(exponent / 2);
      base = (base * base) % modulus;
    }

    return result;
  }

  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ ";

  /**
   * Преобразование текста в число (каждая буква -> её позиция в алфавите)
   */
  function textToNumber(key: string): number {
    const nums: number[] = [];
    for (let i = 0; i < key.length; i++) {
      const index = alphabet.indexOf(key[i]);
      nums.push(index);
    }
    return Number(nums.join(""));
  }

  /**
   * Преобразование числа обратно в текст
   */
  function numberToText(key: string): string {
    const chars: string[] = [];
    for (let i = 0; i < key.length; i++) {
      chars.push(alphabet[Number(key[i])]);
    }
    console.log(chars);
    return chars.join("");
  }

  // Преобразуем ключ Вижинера в число
  const m = textToNumber(key);
  console.log("m: " + m);

  // Вычисляем закрытый ключ d
  const d = modInverse(e, phi);

  // Шифруем текст шифром Вижинера
  const [encrypted, decryptedVisiner] = visiner(text, key);

  // Шифруем ключ Вижинера с помощью RSA (открытый ключ)
  const encryptedKey = modPow(m, e, n);

  // Расшифровываем ключ с помощью RSA (закрытый ключ)
  const decryptedKey = modPow(encryptedKey, d, n);
  console.log("decryptedKey: " + decryptedKey);
  const decryptedKeyText = numberToText(decryptedKey.toString());
  console.log("decryptedKeyText: " + decryptedKeyText);

  // Расшифровываем текст, используя расшифрованный ключ
  const decrypted = encrypted
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      const keyIndex = alphabet.indexOf(
        decryptedKeyText[i % decryptedKeyText.length]
      );
      const newIndex = (index - keyIndex + alphabet.length) % alphabet.length;
      const encrypted = alphabet[newIndex];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

  const openKey = { e, n };
  const secretKey = { d, n };

  return `
Открытый ключ RSA: {${openKey.e},${openKey.n}}
Закрытый ключ RSA: {${secretKey.d},${secretKey.n}}
Ключ шифра вижинера: ${key}
Зашифрованный с RSA ключ шифра вижинера: ${encryptedKey}
Расшифрованный с RSA ключ шифра вижинера: ${decryptedKeyText}

Исходный текст: ${text}
Зашифрованный текст: ${encrypted}
Расшифрованный текст: ${decrypted}`;
}

/**
 * API Route Handler для POST запросов на /api/encrypt
 * Принимает параметры шифрования и возвращает результат
 * @param req - Объект запроса с параметрами { text, method, operation?, rsaP?, rsaQ? }
 * @returns JSON ответ с результатом шифрования/расшифрования
 */
export async function POST(req: Request) {
  const { text, method, operation, rsaP, rsaQ } = await req.json();

  // Валидация входных данных
  if (!text || !method) {
    return NextResponse.json({ result: "Ошибка: отсутствуют текст или метод" });
  }

  // Выполнение шифрования/расшифрования
  let result = Encrypt(method, text, operation, rsaP, rsaQ);
  if (result === "Метод не разработан") {
    result = "Ошибка: метод шифрования не разработан =(";
  }

  return NextResponse.json({ result });
}
