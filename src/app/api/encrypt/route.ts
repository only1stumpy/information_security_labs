import { alpha } from "motion";
import { NextResponse } from "next/server";

function Encrypt(method: string, text: string): string {
  switch (method) {
    case "permutation":
      const [permutationEncrypted, permutationDecrypted] = permutation(text);
      return `Encrypted: ${permutationEncrypted}
Decrypted: ${permutationDecrypted}`;
    case "caesar":
      const decrypts: string[] = [];
      for (let i = 1; i < 33; i++) {
        decrypts[i - 1] = "Сдвиг на " + i + ":\n" + caesar(text, i) + "\n\n";
      }
      return decrypts.join("");
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
      const keys = generateRSAKeys();
      const key = "бебе";
      return `Параметр p: ${keys.p}
Параметр q: ${keys.q}
${RSA(text, key.toUpperCase(), keys.e, keys.n, keys.phi)}`;
    default:
      method = "unknown";
      text = "Ошибка: неизвестный метод шифрования";
  }
  return text;
}

function permutation(text: string): [string, string] {
  console.log("initial text: " + text);
  const key: number[] = [3, 5, 1, 4, 2];
  const blockSize = key.length;
  const blocks: string[] = [];
  const paddedText =
    text + "_".repeat((blockSize - (text.length % blockSize)) % blockSize);
  console.log("padded text: " + paddedText);
  for (let i = 0; i < paddedText.length; i += blockSize) {
    const block = paddedText.slice(i, i + blockSize);
    const encryptedBlock = key.map((k) => block[k - 1]).join("");
    blocks.push(encryptedBlock);
  }
  const encrypted = blocks.join("");
  const inverseKey: number[] = [];
  key.forEach((k, i) => (inverseKey[k - 1] = i + 1));
  const decryptedBlocks: string[] = [];
  for (let i = 0; i < encrypted.length; i += blockSize) {
    const block = encrypted.slice(i, i + blockSize);
    const decryptedBlock = inverseKey.map((k) => block[k - 1]).join("");
    decryptedBlocks.push(decryptedBlock);
  }
  const decrypted = decryptedBlocks.join("").trimEnd();

  return [encrypted, decrypted];
}
function caesar(cipherText: string, shift: number): string {
  const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";

  return cipherText
    .split("")
    .map((ch) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      const newIndex = (index - shift + alphabet.length) % alphabet.length;
      const decrypted = alphabet[newIndex];
      return isLower ? decrypted.toLowerCase() : decrypted;
    })
    .join("");
}
function visiner(text: string, key: string): [string, string] {
  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ ";

  const encrypted = text
    .split("")
    .map((ch, i) => {
      const upper = ch.toUpperCase();
      const isLower = ch === ch.toLowerCase();
      if (!alphabet.includes(upper)) return ch;
      const index = alphabet.indexOf(upper);
      const keyIndex = alphabet.indexOf(key[i % key.length]);
      const newIndex = (index + keyIndex) % alphabet.length;
      const encrypted = alphabet[newIndex];
      return isLower ? encrypted.toLowerCase() : encrypted;
    })
    .join("");

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
function lozung(text: string, key: string): [string, string, string] {
  const alphabet = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЬЭЮЯ";
  const shAlphabet = key + alphabet.slice(key.length - 1, alphabet.length);

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
function generateRSAKeys(): {
  p: number;
  q: number;
  e: number;
  n: number;
  phi: number;
} {
  function isPrime(num: number): boolean {
    if (num < 2) return false;
    if (num === 2) return true;
    if (num % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(num); i += 2) {
      if (num % i === 0) return false;
    }
    return true;
  }
  function gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a;
  }
  function generatePrime(min: number = 100, max: number = 1000): number {
    let prime: number;
    do {
      prime = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (!isPrime(prime));
    return prime;
  }
  let p: number, q: number;
  do {
    p = generatePrime();
    q = generatePrime();
  } while (p === q);
  const n = p * q;
  const phi = (p - 1) * (q - 1);

  function findE(phi: number): number {
    const possibleE = [3, 5, 17, 257, 65537];

    for (const e of possibleE) {
      if (e < phi && gcd(e, phi) === 1) {
        return e;
      }
    }
    let e: number;
    do {
      e = Math.floor(Math.random() * (phi - 2)) + 2;
    } while (gcd(e, phi) !== 1);

    return e;
  }

  const e = findE(phi);

  return { p, q, e, n, phi };
}

function RSA(
  text: string,
  key: string,
  e: number,
  n: number,
  phi: number
): string {
  function modInverse(a: number, m: number): number {
    for (let d = 1; d < m; d++) {
      if ((a * d) % m === 1) {
        return d;
      }
    }
    throw new Error("Обратный элемент не существует");
  }
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
  function textToNumber(key: string): number {
    const nums: number[] = [];
    for (let i = 0; i < key.length; i++) {
      const index = alphabet.indexOf(key[i]);
      nums.push(index);
    }
    return Number(nums.join(""));
  }
  function numberToText(key: string): string {
    const chars: string[] = [];
    for (let i = 0; i < key.length; i++) {
      chars.push(alphabet[Number(key[i])]);
    }
    console.log(chars);
    return chars.join("");
  }
  const m = textToNumber(key);
  console.log("m: " + m);

  const d = modInverse(e, phi);
  const [encrypted, decryptedVisiner] = visiner(text, key);
  const encryptedKey = modPow(m, e, n);

  const decryptedKey = modPow(encryptedKey, d, n);
  console.log("decryptedKey: " + decryptedKey);
  const decryptedKeyText = numberToText(decryptedKey.toString());
  console.log("decryptedKeyText: " + decryptedKeyText);
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

export async function POST(req: Request) {
  const { text, method } = await req.json();
  if (!text || !method) {
    return NextResponse.json({ result: "Ошибка: отсутствуют текст или метод" });
  }
  let result = Encrypt(method, text);
  if (result === "Метод не разработан") {
    result = "Ошибка: метод шифрования не разработан =(";
  }
  return NextResponse.json({ result });
}
