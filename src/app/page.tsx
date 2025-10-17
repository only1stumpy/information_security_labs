"use client";
import DecryptedText from "@/components/DecryptedText";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [method, setMethod] = useState("permutation");
  const [result, setResult] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, method }),
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
          onChange={(e) => setMethod(e.target.value)}
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

        <button
          onClick={() => fillInput(method)}
          className="w-full py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                     hover:bg-[#ffb627] transition-all shadow-md mb-2 max-w-lg"
        >
          Использовать данные из методички
        </button>
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-[#fca311] text-[#000000] rounded-xl font-semibold
                     hover:bg-[#ffb627] transition-all shadow-md max-w-lg"
        >
          Подтвердить
        </button>

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
