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
  rsaQ?: number,
  rsaE?: number,
  rsaKey?: string
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
      const keys = generateRSAKeys(rsaP, rsaQ, rsaE);
      if (keys.error) {
        return keys.error;
      }
      const key = rsaKey || "бебе";
      return `Параметр p: ${keys.p}${rsaP ? " (пользовательский)" : " (сгенерированный)"}
Параметр q: ${keys.q}${rsaQ ? " (пользовательский)" : " (сгенерированный)"}
Открытая экспонента e: ${keys.e}${rsaE ? " (пользовательская)" : " (сгенерированная)"}
${RSA(text, key.toUpperCase(), keys.e, keys.n, keys.phi)}`;
    case "SHA-256":
      return sha256(text);
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
 * SHA-256 хеширующая функция
 * Реализация криптографической хеш-функции SHA-256 без использования библиотек
 * @param message - Исходное сообщение для хеширования
 * @returns Строка с исходным сообщением, двоичным представлением и хеш-суммой
 */
function sha256(message: string): string {
  /**
   * Циклический сдвиг вправо (right rotate)
   * @param value - 32-битное число
   * @param count - Количество позиций для сдвига
   * @returns Результат циклического сдвига
   */
  function rightRotate(value: number, count: number): number {
    return (value >>> count) | (value << (32 - count));
  }

  /**
   * Предобработка сообщения (добавление padding)
   * Добавляет бит 1, нули и длину сообщения для выравнивания до 512 бит
   * @param msg - Исходное сообщение
   * @returns Массив 32-битных слов
   */
  function preprocessMessage(msg: string): number[] {
    // Конвертируем строку в массив байтов (UTF-8)
    const msgBytes: number[] = [];
    for (let i = 0; i < msg.length; i++) {
      const charCode = msg.charCodeAt(i);
      // UTF-8 кодирование: различные диапазоны требуют разное количество байт
      if (charCode < 0x80) {
        // ASCII символы (0-127): 1 байт
        msgBytes.push(charCode);
      } else if (charCode < 0x800) {
        // Символы 128-2047: 2 байта (110xxxxx 10xxxxxx)
        msgBytes.push(0xc0 | (charCode >> 6));
        msgBytes.push(0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        // Символы 2048-65535 (кроме суррогатов): 3 байта (1110xxxx 10xxxxxx 10xxxxxx)
        msgBytes.push(0xe0 | (charCode >> 12));
        msgBytes.push(0x80 | ((charCode >> 6) & 0x3f));
        msgBytes.push(0x80 | (charCode & 0x3f));
      } else {
        // Суррогатные пары (для эмодзи и редких символов): 4 байта
        i++;
        const surrogate =
          0x10000 + (((charCode & 0x3ff) << 10) | (msg.charCodeAt(i) & 0x3ff));
        msgBytes.push(0xf0 | (surrogate >> 18));
        msgBytes.push(0x80 | ((surrogate >> 12) & 0x3f));
        msgBytes.push(0x80 | ((surrogate >> 6) & 0x3f));
        msgBytes.push(0x80 | (surrogate & 0x3f));
      }
    }

    const msgLengthBits = msgBytes.length * 8;

    // Добавляем бит 1 (байт 0x80)
    msgBytes.push(0x80);

    // Добавляем нули до тех пор, пока длина не станет 448 mod 512 (56 mod 64 байт)
    while (msgBytes.length % 64 !== 56) {
      msgBytes.push(0x00);
    }

    // Добавляем длину исходного сообщения в битах (64 бита, big-endian)
    // Для простоты используем только младшие 32 бита (достаточно для большинства сообщений)
    for (let i = 0; i < 4; i++) {
      msgBytes.push(0x00); // Старшие 32 бита = 0
    }
    for (let i = 3; i >= 0; i--) {
      msgBytes.push((msgLengthBits >>> (i * 8)) & 0xff);
    }

    // Конвертируем байты в 32-битные слова (big-endian)
    const words: number[] = [];
    for (let i = 0; i < msgBytes.length; i += 4) {
      words.push(
        (msgBytes[i] << 24) |
          (msgBytes[i + 1] << 16) |
          (msgBytes[i + 2] << 8) |
          msgBytes[i + 3]
      );
    }

    return words;
  }

  // Инициализационные значения хеша (первые 32 бита дробной части квадратных корней первых 8 простых чисел)
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  // Константы (первые 32 бита дробной части кубических корней первых 64 простых чисел)
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  // Предобработка сообщения
  const paddedMessage = preprocessMessage(message);

  // Обрабатываем сообщение блоками по 512 бит (16 слов по 32 бита)
  for (let chunk = 0; chunk < paddedMessage.length; chunk += 16) {
    // Создаем расписание сообщений (message schedule) w[0..63]
    const w: number[] = new Array(64);

    // Копируем текущий блок в первые 16 слов
    for (let i = 0; i < 16; i++) {
      w[i] = paddedMessage[chunk + i];
    }

    // Расширяем первые 16 слов в оставшиеся 48 слов w[16..63]
    // Используя формулы смешивания для создания псевдослучайных значений
    for (let i = 16; i < 64; i++) {
      // σ0 (малая сигма 0): ROTR^7(x) ⊕ ROTR^18(x) ⊕ SHR^3(x)
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      // σ1 (малая сигма 1): ROTR^17(x) ⊕ ROTR^19(x) ⊕ SHR^10(x)
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      // w[i] = w[i-16] + σ0 + w[i-7] + σ1 (mod 2^32)
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    // Инициализируем рабочие переменные значениями текущего хеша
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    // Главный цикл компрессии (64 раунда)
    // Каждый раунд изменяет рабочие переменные используя константы k[i] и слова расписания w[i]
    for (let i = 0; i < 64; i++) {
      // Σ1 (большая сигма 1): ROTR^6(e) ⊕ ROTR^11(e) ⊕ ROTR^25(e)
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      // Ch (choose): (e AND f) ⊕ (NOT e AND g) - выбор битов f или g в зависимости от e
      const ch = (e & f) ^ (~e & g);
      // temp1 = h + Σ1 + Ch + k[i] + w[i]
      const temp1 = (h + S1 + ch + k[i] + w[i]) >>> 0;
      // Σ0 (большая сигма 0): ROTR^2(a) ⊕ ROTR^13(a) ⊕ ROTR^22(a)
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      // Maj (majority): (a AND b) ⊕ (a AND c) ⊕ (b AND c) - мажоритарная функция
      const maj = (a & b) ^ (a & c) ^ (b & c);
      // temp2 = Σ0 + Maj
      const temp2 = (S0 + maj) >>> 0;

      // Сдвиг переменных и обновление
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    // Добавляем результат к хешу
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  // Формируем финальный хеш
  const hash = [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((h) => h.toString(16).padStart(8, "0"))
    .join("");

  // Формируем двоичное представление исходного сообщения
  let binaryRepresentation = "";
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    // Преобразуем в двоичную строку и дополняем нулями до нужной длины
    if (charCode < 0x80) {
      binaryRepresentation += charCode.toString(2).padStart(8, "0") + " ";
    } else if (charCode < 0x800) {
      const byte1 = 0xc0 | (charCode >> 6);
      const byte2 = 0x80 | (charCode & 0x3f);
      binaryRepresentation +=
        byte1.toString(2).padStart(8, "0") +
        " " +
        byte2.toString(2).padStart(8, "0") +
        " ";
    } else {
      const byte1 = 0xe0 | (charCode >> 12);
      const byte2 = 0x80 | ((charCode >> 6) & 0x3f);
      const byte3 = 0x80 | (charCode & 0x3f);
      binaryRepresentation +=
        byte1.toString(2).padStart(8, "0") +
        " " +
        byte2.toString(2).padStart(8, "0") +
        " " +
        byte3.toString(2).padStart(8, "0") +
        " ";
    }
  }

  return `Исходное сообщение:
${message}

Двоичное представление:
${binaryRepresentation.trim()}

SHA-256 хеш-сумма:
${hash.toUpperCase()}`;
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
 * @param customE - Пользовательское значение e (опционально)
 * @returns Объект с параметрами RSA (p, q, e, n, phi) или ошибкой
 */
function generateRSAKeys(
  customP?: number,
  customQ?: number,
  customE?: number
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
   * Увеличен диапазон до 10000, чтобы n = p*q был достаточно большим для любого ключа
   */
  function generatePrime(min: number = 1000, max: number = 10000): number {
    let prime: number;
    let attempts = 0;
    do {
      prime = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;
      // Защита от бесконечного цикла
      if (attempts > 10000) {
        throw new Error("Не удалось сгенерировать простое число");
      }
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

  let e: number;

  // Используем пользовательское значение e если оно указано
  if (customE !== undefined) {
    // Проверяем валидность e
    if (customE < 2) {
      return {
        p: 0,
        q: 0,
        e: 0,
        n: 0,
        phi: 0,
        error: `Ошибка: Открытая экспонента e = ${customE} должна быть >= 2.`,
      };
    }
    if (customE >= phi) {
      return {
        p: 0,
        q: 0,
        e: 0,
        n: 0,
        phi: 0,
        error: `Ошибка: Открытая экспонента e = ${customE} должна быть меньше φ(n) = ${phi}. Выберите меньшее значение или большие p и q.`,
      };
    }
    if (gcd(customE, phi) !== 1) {
      return {
        p: 0,
        q: 0,
        e: 0,
        n: 0,
        phi: 0,
        error: `Ошибка: Открытая экспонента e = ${customE} должна быть взаимно простой с φ(n) = ${phi}. НОД(${customE}, ${phi}) = ${gcd(customE, phi)} ≠ 1. Попробуйте другое значение (например: 3, 5, 17, 257, 65537).`,
      };
    }
    e = customE;
  } else {
    // Генерируем автоматически
    e = findE(phi);
  }

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
   * Использует BigInt для поддержки больших чисел
   */
  function modInverse(a: bigint, m: bigint): bigint {
    // Расширенный алгоритм Евклида
    let [oldR, r] = [a, m];
    let [oldS, s] = [1n, 0n];

    while (r !== 0n) {
      const quotient = oldR / r;
      [oldR, r] = [r, oldR - quotient * r];
      [oldS, s] = [s, oldS - quotient * s];
    }

    if (oldR !== 1n) {
      throw new Error("Обратный элемент не существует");
    }

    // Убеждаемся, что результат положительный
    return oldS < 0n ? oldS + m : oldS;
  }

  /**
   * Модульное возведение в степень (быстрое возведение в степень)
   * Вычисляет (base^exponent) mod modulus эффективно
   * Использует BigInt для поддержки больших чисел
   */
  function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent / 2n;
      base = (base * base) % modulus;
    }

    return result;
  }

  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ ";

  /**
   * Преобразование текста в число (каждая буква -> её позиция в алфавите с фиксированной шириной)
   * Используется фиксированная ширина 2 цифры для каждой позиции (00-32)
   * Возвращает объект с числом и исходной длиной строки
   */
  function textToNumber(key: string): { num: bigint; originalLength: number } {
    const nums: string[] = [];
    for (let i = 0; i < key.length; i++) {
      const index = alphabet.indexOf(key[i]);
      if (index === -1) {
        throw new Error(
          `Недопустимый символ в ключе: "${key[i]}". Используйте только русские буквы и пробел.`
        );
      }
      // Добавляем ведущий 0 для позиций < 10, чтобы всегда было 2 цифры
      nums.push(index.toString().padStart(2, "0"));
    }
    const numStr = nums.join("");
    return { num: BigInt(numStr), originalLength: numStr.length };
  }

  /**
   * Преобразование числа обратно в текст
   * Разбивает число по 2 цифры и конвертирует обратно в буквы
   */
  function numberToText(numStr: string, expectedLength: number): string {
    // Восстанавливаем ведущие нули до нужной длины
    const paddedStr = numStr.padStart(expectedLength, "0");

    const chars: string[] = [];
    // Разбиваем строку по 2 символа
    for (let i = 0; i < paddedStr.length; i += 2) {
      const twoDigits = paddedStr.substring(i, i + 2);
      const index = Number(twoDigits);
      if (index >= 0 && index < alphabet.length) {
        chars.push(alphabet[index]);
      } else {
        throw new Error(
          `Недопустимый индекс при расшифровке: ${index}. Проверьте параметры p и q.`
        );
      }
    }
    console.log("Расшифрованный ключ:", chars.join(""));
    return chars.join("");
  }

  // Преобразуем ключ Вижинера в число
  const { num: m, originalLength: keyLength } = textToNumber(key);
  console.log("Ключ в виде числа: " + m);
  console.log("Длина ключа в символах: " + keyLength);

  // Конвертируем параметры RSA в BigInt
  const eBig = BigInt(e);
  const nBig = BigInt(n);
  const phiBig = BigInt(phi);

  // Проверяем, что ключ меньше n
  if (m >= nBig) {
    throw new Error(
      `Ключ слишком большой для выбранных параметров p и q. Ключ=${m}, n=${nBig}. Выберите большие простые числа (p и q) или используйте более короткий ключ.`
    );
  }

  // Вычисляем закрытый ключ d
  const d = modInverse(eBig, phiBig);

  // Проверяем, что открытый и закрытый ключи не совпадают
  if (eBig === d) {
    throw new Error(
      `Ошибка: Открытый ключ (e=${e}) и закрытый ключ (d=${d}) не должны совпадать. Выберите другие параметры p, q или e.`
    );
  }

  // Шифруем текст шифром Вижинера
  const [encrypted, decryptedVisiner] = visiner(text, key);

  // Шифруем ключ Вижинера с помощью RSA (открытый ключ)
  const encryptedKey = modPow(m, eBig, nBig);

  // Расшифровываем ключ с помощью RSA (закрытый ключ)
  const decryptedKey = modPow(encryptedKey, d, nBig);
  console.log("Расшифрованный ключ (число): " + decryptedKey);

  // Конвертируем обратно в текст, используя исходную длину
  const decryptedKeyStr = decryptedKey.toString();
  const decryptedKeyText = numberToText(decryptedKeyStr, keyLength);

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
  const secretKey = { d: d.toString(), n };

  return `
Открытый ключ RSA: {${openKey.e},${openKey.n}}
Закрытый ключ RSA: {${secretKey.d},${secretKey.n}}
Ключ шифра вижинера: ${key}
Числовое представление ключа: ${m}
Зашифрованный с RSA ключ шифра вижинера: ${encryptedKey}
Расшифрованный с RSA ключ шифра вижинера (число): ${decryptedKey}
Расшифрованный с RSA ключ шифра вижинера (текст): ${decryptedKeyText}

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
  const { text, method, operation, rsaP, rsaQ, rsaE, rsaKey } =
    await req.json();

  // Валидация входных данных
  if (!text || !method) {
    return NextResponse.json({ result: "Ошибка: отсутствуют текст или метод" });
  }

  try {
    // Выполнение шифрования/расшифрования
    let result = Encrypt(method, text, operation, rsaP, rsaQ, rsaE, rsaKey);
    if (result === "Метод не разработан") {
      result = "Ошибка: метод шифрования не разработан =(";
    }

    return NextResponse.json({ result });
  } catch (error) {
    // Обрабатываем ошибки шифрования
    const errorMessage =
      error instanceof Error ? error.message : "Неизвестная ошибка";
    return NextResponse.json({ result: `Ошибка: ${errorMessage}` });
  }
}
