"use client";
import DecryptedText from "@/components/DecryptedText";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [method, setMethod] = useState("permutation");
  const [result, setResult] = useState("");
  const [rsaP, setRsaP] = useState("");
  const [rsaQ, setRsaQ] = useState("");
  const [rsaE, setRsaE] = useState("");
  const [rsaKey, setRsaKey] = useState("");

  const handleSubmit = async (operation?: "encrypt" | "decrypt") => {
    try {
      const body: {
        text: string;
        method: string;
        operation?: "encrypt" | "decrypt";
        rsaP?: number;
        rsaQ?: number;
        rsaE?: number;
        rsaKey?: string;
      } = { text, method, operation };

      // Добавляем параметры RSA если они указаны
      if (method === "RSA") {
        if (rsaP) body.rsaP = Number(rsaP);
        if (rsaQ) body.rsaQ = Number(rsaQ);
        if (rsaE) body.rsaE = Number(rsaE);
        if (rsaKey) body.rsaKey = rsaKey;
      }

      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      setResult(data.result || "Ошибка при получении данных");
    } catch {
      setResult("Ошибка соединения с API");
    }
  };
  function fillInput(method: string) {
    switch (method) {
      case "permutation":
        setText("Не пей пену у репейника");
        break;
      case "caesar":
        setText(
          "втюъе щоъоыьйчшлфт илхизьыи ыйцецт щъшыьецт т лоъшиьчш ыйцецт нъолчтцт втюъйцт"
        );
        break;
      case "visiner":
        setText(
          "Различают разные измерения информации: техническая и семантическая меры."
        );
        break;
      case "lozung":
        setText("Евгений Владиславович");
        break;
      case "RSA":
        setText(
          "Различают разные измерения информации: техническая и семантическая меры."
        );
        break;
      case "SHA-256":
        setText("");
        break;
      default:
        setText("");
    }
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-5xl font-bold mb-10 text-center">
        Information Security (Variant 10)
      </h1>

      <div className="w-full flex flex-col items-center">
        <input
          type="text"
          placeholder="Введите текст для шифрования"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-[#fca311] rounded-xl p-3 mb-6 bg-[#000000] text-[#e5e5e5]
                     placeholder-[#e5e5e5]/60 focus:outline-none focus:ring-2 focus:ring-[#fca311] max-w-lg"
        />

        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            // Очистить поля RSA при смене метода
            if (e.target.value !== "RSA") {
              setRsaP("");
              setRsaQ("");
              setRsaE("");
              setRsaKey("");
            }
          }}
          className="w-full border border-[#fca311] rounded-xl p-3 mb-6 bg-[#000000] text-[#e5e5e5]
                     focus:outline-none focus:ring-2 focus:ring-[#fca311] max-w-lg"
        >
          <option value="permutation">Шифр Простой Перестановки</option>
          <option value="caesar">Шифр Цезаря</option>
          <option value="visiner">Шифр Вижинера</option>
          <option value="lozung">Лозунговый Шифр</option>
          <option value="RSA">RSA</option>
          <option value="SHA-256">SHA-256</option>
        </select>

        {method === "RSA" && (
          <>
            <div className="w-full flex gap-3 mb-4 max-w-lg">
              <div className="flex-1">
                <label className="block text-[#e5e5e5] text-sm mb-2">
                  Параметр p (простое число)
                </label>
                <input
                  type="number"
                  placeholder="Автогенерация"
                  value={rsaP}
                  onChange={(e) => setRsaP(e.target.value)}
                  className="w-full border border-[#fca311] rounded-xl p-3 bg-[#000000] text-[#e5e5e5]
                             placeholder-[#e5e5e5]/60 focus:outline-none focus:ring-2 focus:ring-[#fca311]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[#e5e5e5] text-sm mb-2">
                  Параметр q (простое число)
                </label>
                <input
                  type="number"
                  placeholder="Автогенерация"
                  value={rsaQ}
                  onChange={(e) => setRsaQ(e.target.value)}
                  className="w-full border border-[#fca311] rounded-xl p-3 bg-[#000000] text-[#e5e5e5]
                             placeholder-[#e5e5e5]/60 focus:outline-none focus:ring-2 focus:ring-[#fca311]"
                />
              </div>
            </div>
            <div className="w-full mb-4 max-w-lg">
              <label className="block text-[#e5e5e5] text-sm mb-2">
                Открытая экспонента e
              </label>
              <input
                type="number"
                placeholder="По умолчанию: 3, 5, 17, 257, или 65537"
                value={rsaE}
                onChange={(e) => setRsaE(e.target.value)}
                className="w-full border border-[#fca311] rounded-xl p-3 bg-[#000000] text-[#e5e5e5]
                           placeholder-[#e5e5e5]/60 focus:outline-none focus:ring-2 focus:ring-[#fca311]"
              />
            </div>
            <div className="w-full mb-6 max-w-lg">
              <label className="block text-[#e5e5e5] text-sm mb-2">
                Ключ для шифра Вижинера
              </label>
              <input
                type="text"
                placeholder="По умолчанию: бебе"
                value={rsaKey}
                onChange={(e) => setRsaKey(e.target.value)}
                className="w-full border border-[#fca311] rounded-xl p-3 bg-[#000000] text-[#e5e5e5]
                           placeholder-[#e5e5e5]/60 focus:outline-none focus:ring-2 focus:ring-[#fca311]"
              />
            </div>
          </>
        )}

        <button
          onClick={() => fillInput(method)}
          className="w-full py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                     hover:bg-[#ffb627] transition-all shadow-md mb-2 max-w-lg"
        >
          Использовать данные из методички
        </button>

        {method === "caesar" ? (
          <div className="w-full flex gap-2 max-w-lg">
            <button
              onClick={() => handleSubmit("encrypt")}
              className="flex-1 py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                         hover:bg-[#ffb627] transition-all shadow-md"
            >
              Зашифровать
            </button>
            <button
              onClick={() => handleSubmit("decrypt")}
              className="flex-1 py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                         hover:bg-[#ffb627] transition-all shadow-md"
            >
              Расшифровать
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleSubmit()}
            className="w-full py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                       hover:bg-[#ffb627] transition-all shadow-md max-w-lg"
          >
            Подтвердить
          </button>
        )}

        {result && (
          <div className="mt-8 w-full max-w-4xl bg-[#000000] border border-[#fca311] rounded-xl p-4 text-[#e5e5e5]">
            <h2 className="text-lg font-semibold mb-2 text-[#fca311]">
              Результат:
            </h2>
            <div style={{ marginTop: "1rem" }}>
              <DecryptedText
                text={result}
                animateOn="view"
                revealDirection="start"
                speed={250}
                useOriginalCharsOnly={true}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
